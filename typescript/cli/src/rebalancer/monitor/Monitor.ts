import EventEmitter from 'events';

import { IRegistry } from '@hyperlane-xyz/registry';
import { MultiProtocolProvider } from '@hyperlane-xyz/sdk';
import { WarpCore } from '@hyperlane-xyz/sdk';
import { objMap, objMerge } from '@hyperlane-xyz/utils';

import { IMonitor, MonitorEvent } from '../interfaces/IMonitor.js';

export class Monitor implements IMonitor {
  private readonly MONITOR_EVENT = 'monitor';
  private readonly emitter = new EventEmitter();
  private interval: NodeJS.Timeout | undefined;

  constructor(
    private readonly registry: IRegistry,
    private readonly warpRouteId: string,
    private readonly checkFrequency: number,
  ) {}

  subscribe(fn: (data: MonitorEvent) => void) {
    this.emitter.on(this.MONITOR_EVENT, fn);
  }

  async start() {
    if (this.interval) {
      throw new Error('Monitor already running');
    }

    const metadata = await this.registry.getMetadata();
    const addresses = await this.registry.getAddresses();
    const mailboxes = objMap(addresses, (_, { mailbox }) => ({ mailbox }));
    const provider = new MultiProtocolProvider(objMerge(metadata, mailboxes));
    const warpCoreConfig = await this.registry.getWarpRoute(this.warpRouteId);
    const warpCore = WarpCore.FromConfig(provider, warpCoreConfig);

    this.interval = setInterval(async () => {
      const event: MonitorEvent = {
        balances: [],
      };

      for (const token of warpCore.tokens) {
        if (!token.isCollateralized()) {
          break;
        }

        const adapter = token.getHypAdapter(warpCore.multiProvider);
        const bridgedSupply = await adapter.getBridgedSupply();

        event.balances.push({
          chain: token.chainName,
          owner: token.addressOrDenom,
          token: token.collateralAddressOrDenom!,
          value: bridgedSupply!,
        });
      }

      this.emitter.emit(this.MONITOR_EVENT, event);
    }, this.checkFrequency);
  }
}
