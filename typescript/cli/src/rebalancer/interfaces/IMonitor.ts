import { ChainName } from '@hyperlane-xyz/sdk';

export type MonitorEvent = {
  balances: {
    token: string;
    owner: string;
    chain: ChainName;
    value: bigint;
  }[];
};

export interface IMonitor {
  subscribe(fn: (event: MonitorEvent) => void): void;

  start(): Promise<void>;
}
