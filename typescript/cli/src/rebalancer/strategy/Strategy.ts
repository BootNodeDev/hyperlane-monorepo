import EventEmitter from 'events';

import { MonitorEvent } from '../interfaces/IMonitor.js';
import { IStrategy, StrategyEvent } from '../interfaces/IStrategy.js';

export class Strategy implements IStrategy {
  private readonly STRATEGY_EVENT = 'strategy';
  private readonly emitter = new EventEmitter();

  subscribe(fn: (event: StrategyEvent) => void): void {
    this.emitter.on(this.STRATEGY_EVENT, fn);
  }

  async handleMonitorEvent(event: MonitorEvent): Promise<void> {
    const strategyEvent: StrategyEvent = {
      route: event.balances.map((b) => ({
        origin: b.chain,
        destination: b.chain,
        token: b.token,
        amount: b.value,
      })),
    };
    this.emitter.emit(this.STRATEGY_EVENT, strategyEvent);
  }
}
