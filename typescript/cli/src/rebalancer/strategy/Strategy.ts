import { ChainName } from '@hyperlane-xyz/sdk';

export type Route = {
  fromChain: ChainName;
  toChain: ChainName;
  amount: bigint;
};

export class Strategy {
  getRebalancingRoutes(balances: Record<ChainName, bigint>): Route[] {
    const entries = Object.entries(balances);
    const total = entries.reduce((sum, [, balance]) => sum + balance, 0n);
    const target = total / BigInt(entries.length);

    const surpluss: { chain: ChainName; amount: bigint }[] = [];
    const deficits: { chain: ChainName; amount: bigint }[] = [];

    for (const [chain, balance] of entries) {
      if (balance < target) {
        deficits.push({ chain, amount: target - balance });
      } else if (balance > target) {
        surpluss.push({ chain, amount: balance - target });
      } else {
        // Do nothing as the balance is already on target
      }
    }

    const routes: Route[] = [];

    while (surpluss.length > 0 && deficits.length > 0) {
      const surplus = surpluss[0];
      const deficit = deficits[0];
      const fromChain = surplus.chain;
      const toChain = deficit.chain;

      if (surplus.amount > deficit.amount) {
        routes.push({
          fromChain,
          toChain,
          amount: deficit.amount,
        });

        deficits.shift();

        surplus.amount -= deficit.amount;
      } else if (surplus.amount < deficit.amount) {
        routes.push({
          fromChain,
          toChain,
          amount: surplus.amount,
        });

        surpluss.shift();

        deficit.amount -= surplus.amount;
      } else {
        routes.push({
          fromChain,
          toChain,
          amount: surplus.amount,
        });

        deficits.shift();
        surpluss.shift();
      }
    }

    return routes;
  }
}
