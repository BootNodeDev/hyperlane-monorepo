import { StrategyEvent } from './IStrategy.js';

export interface IExecutor {
  handleStrategyEvent(event: StrategyEvent): Promise<void>;
}
