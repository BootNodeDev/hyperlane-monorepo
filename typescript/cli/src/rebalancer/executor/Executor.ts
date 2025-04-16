import { IExecutor } from '../interfaces/IExecutor.js';
import { StrategyEvent } from '../interfaces/IStrategy.js';

export class Executor implements IExecutor {
  async handleStrategyEvent(_event: StrategyEvent): Promise<void> {
    console.log('Executing strategy event:', _event);
  }
}
