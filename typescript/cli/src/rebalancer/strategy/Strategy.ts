import { ChainName } from '@hyperlane-xyz/sdk';

import {
  IStrategy,
  RawBalances,
  RebalancingRoute,
} from '../interfaces/IStrategy.js';

export class Strategy implements IStrategy {
  /**
   * @param tolerance Value used to prevent rebalancing amounts that are already close to the target
   */
  constructor(
    private readonly tolerance: bigint = 0n,
    private readonly weights: Record<ChainName, bigint>,
  ) {
    if (Object.values(weights).reduce((acc, next) => acc + next, 0n) !== 100n) {
      throw new Error('Weights must add up to 100');
    }
  }

  /**
   * Get the optimized routes that will rebalance all chains to the same balance
   */
  getRebalancingRoutes(rawBalances: RawBalances): RebalancingRoute[] {
    const entries = Object.entries(rawBalances);
    // Get the total balance from all chains
    const total = entries.reduce((sum, [, balance]) => sum + balance, 0n);

    // How much each chain should have according to the weights
    const targets = Object.entries(this.weights).reduce(
      (targets, [chain, weight]) => {
        targets[chain] = (total * weight) / 100n;
        return targets;
      },
      {} as Record<ChainName, bigint>,
    );

    // Group balances by balances with surplus or deficit
    const { surpluss, deficits } = entries.reduce(
      (acc, [chain, balance]) => {
        const target = targets[chain];

        if (balance < target) {
          acc.deficits.push({ chain, amount: target - balance });
        } else if (balance > target) {
          acc.surpluss.push({ chain, amount: balance - target });
        } else {
          // Do nothing as the balance is already on target
        }

        return acc;
      },
      {
        surpluss: [] as { chain: ChainName; amount: bigint }[],
        deficits: [] as { chain: ChainName; amount: bigint }[],
      },
    );

    const routes: RebalancingRoute[] = [];

    while (surpluss.length > 0 && deficits.length > 0) {
      const surplus = surpluss[0];
      const deficit = deficits[0];

      const transferAmount =
        surplus.amount < deficit.amount ? surplus.amount : deficit.amount;

      routes.push({
        fromChain: surplus.chain,
        toChain: deficit.chain,
        amount: transferAmount,
      });

      deficit.amount -= transferAmount;
      surplus.amount -= transferAmount;

      if (!deficit.amount) {
        deficits.shift();
      }

      if (!surplus.amount) {
        surpluss.shift();
      }
    }

    return routes;
  }
}
