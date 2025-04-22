import { ChainName } from '@hyperlane-xyz/sdk';

import {
  IStrategy,
  RawBalances,
  RebalancingRoute,
} from '../interfaces/IStrategy.js';

/**
 * Per chain configuration for the strategy
 */
type Config = Record<
  ChainName,
  {
    /**
     * How much in % of the total balance the chain should have
     */
    weight: bigint;
    /**
     * How much in % of the target balance a deficitary chain can
     * deviate before being considered unbalanced
     */
    tolerance: bigint;
  }
>;

/**
 * The amount of tokens that a chain deviates from the target balance
 */
type Delta = { chain: ChainName; amount: bigint };

export class Strategy implements IStrategy {
  constructor(private readonly config: Config) {
    let totalWeight = 0n;

    for (const [, { weight, tolerance }] of Object.entries(config)) {
      if (weight > 100n || weight < 0n) {
        throw new Error('Weight must be between 0 and 100');
      }

      if (tolerance > 100n || tolerance < 0n) {
        throw new Error('Tolerance must be between 0 and 100');
      }

      totalWeight += weight;
    }

    if (totalWeight !== 100n) {
      throw new Error('Weights must add up to 100');
    }
  }

  /**
   * Get the optimized routes that will rebalance all chains to the same balance
   */
  getRebalancingRoutes(rawBalances: RawBalances): RebalancingRoute[] {
    const entries = Object.entries(rawBalances);

    for (const [chain, balance] of entries) {
      if (!this.config[chain]) {
        throw new Error(`Chain ${chain} not found in configuration`);
      }

      if (balance < 0n) {
        throw new Error(`Balance ${balance} is negative`);
      }
    }

    // Get the total balance from all chains
    const total = entries.reduce((sum, [, balance]) => sum + balance, 0n);

    // How much each chain should have according to the weights
    const targets = Object.entries(this.config).reduce(
      (targets, [chain, { weight }]) => {
        targets[chain] = (total * weight) / 100n;
        return targets;
      },
      {} as Record<ChainName, bigint>,
    );

    // Group balances by balances with surplus or deficit
    const { surpluss, deficits } = entries.reduce(
      (acc, [chain, balance]) => {
        const target = targets[chain];
        const tolerance = this.config[chain].tolerance;
        const toleranceAmount = (target * tolerance) / 100n;

        // Apply the tolerance to deficits to prevent small imbalances
        if (balance < target - toleranceAmount) {
          acc.deficits.push({ chain, amount: target - balance });
        } else if (balance > target) {
          acc.surpluss.push({ chain, amount: balance - target });
        } else {
          // Do nothing as the balance is already on target
        }

        return acc;
      },
      {
        surpluss: [] as Delta[],
        deficits: [] as Delta[],
      },
    );

    // Sort from largest to smallest amounts as to always transfer largest amounts
    // first and decrease the amount of routes required
    surpluss.sort((a, b) => (a.amount > b.amount ? -1 : 1));
    deficits.sort((a, b) => (a.amount > b.amount ? -1 : 1));

    const routes: RebalancingRoute[] = [];

    // Transfer from surplus to deficit until all deficits are balanced.
    // It is not possible in this implementation for surpluses to run out before deficits
    while (deficits.length > 0) {
      const surplus = surpluss[0];
      const deficit = deficits[0];

      // Transfers the whole surplus or just the amount to balance the deficit
      const transferAmount =
        surplus.amount > deficit.amount ? deficit.amount : surplus.amount;

      // Creates the balancing route
      routes.push({
        fromChain: surplus.chain,
        toChain: deficit.chain,
        amount: transferAmount,
      });

      // Decreases the amounts for the following iterations
      deficit.amount -= transferAmount;
      surplus.amount -= transferAmount;

      // Removes the deficit if it is fully balanced
      if (!deficit.amount) {
        deficits.shift();
      }

      // Removes the surplus if it has been drained
      if (!surplus.amount) {
        surpluss.shift();
      }
    }

    return routes;
  }
}
