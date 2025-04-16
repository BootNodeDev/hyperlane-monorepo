import { ChainName } from '@hyperlane-xyz/sdk';

import { MonitorEvent } from './IMonitor.js';

export type StrategyEvent = {
  route: {
    origin: ChainName;
    destination: ChainName;
    token: string;
    amount: bigint;
  }[];
};

export interface IStrategy {
  subscribe(fn: (event: StrategyEvent) => void): void;

  handleMonitorEvent(event: MonitorEvent): Promise<void>;
}
