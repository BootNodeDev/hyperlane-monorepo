import { Wallet } from 'ethers';
import { ProcessPromise } from 'zx';
import { $ } from 'zx';

import { createWarpRouteConfigId } from '@hyperlane-xyz/registry';
import { TokenType, WarpRouteDeployConfig } from '@hyperlane-xyz/sdk';
import { assert, toWei } from '@hyperlane-xyz/utils';

import { writeYamlOrJson } from '../../utils/files.js';
import {
  ANVIL_KEY,
  CHAIN_NAME_2,
  CHAIN_NAME_3,
  CHAIN_NAME_4,
  CORE_CONFIG_PATH,
  DEFAULT_E2E_TEST_TIMEOUT,
  deployOrUseExistingCore,
  deployToken,
  getCombinedWarpRoutePath,
} from '../commands/helpers.js';
import {
  hyperlaneWarpDeploy,
  hyperlaneWarpRebalancer,
  hyperlaneWarpSendRelay,
} from '../commands/warp.js';

describe('hyperlane warp rebalancer e2e tests', async function () {
  this.timeout(2 * DEFAULT_E2E_TEST_TIMEOUT);

  const CHECK_FREQUENCY = 1000;

  let warpDeploymentPath: string;
  let tokenSymbol: string;
  let warpRouteId: string;

  let process: ProcessPromise | undefined;
  let snapshot1: string;
  let snapshot2: string;
  let snapshot3: string;

  async function createSnapshot(rpcUrl: string): Promise<string> {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 1337,
        jsonrpc: '2.0',
        method: 'evm_snapshot',
        params: [],
      }),
    });
    const data = await response.json();
    return data.result;
  }

  async function restoreSnapshot(rpcUrl: string, snapshot: string) {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 1337,
        jsonrpc: '2.0',
        method: 'evm_revert',
        params: [snapshot],
      }),
    });
    const data = await response.json();
    assert(data.result, 'Failed to revert snapshot');
  }

  before(async () => {
    const ogVerbose = $.verbose;
    $.verbose = false;

    // Deploy core contracts on all chains
    const [chain2Addresses, chain3Addresses, chain4Addresses] =
      await Promise.all([
        deployOrUseExistingCore(CHAIN_NAME_2, CORE_CONFIG_PATH, ANVIL_KEY),
        deployOrUseExistingCore(CHAIN_NAME_3, CORE_CONFIG_PATH, ANVIL_KEY),
        deployOrUseExistingCore(CHAIN_NAME_4, CORE_CONFIG_PATH, ANVIL_KEY),
      ]);

    // Deploy ERC20s
    const [tokenChain2, tokenChain3] = await Promise.all([
      deployToken(ANVIL_KEY, CHAIN_NAME_2),
      deployToken(ANVIL_KEY, CHAIN_NAME_3),
    ]);
    tokenSymbol = await tokenChain2.symbol();

    // Deploy Warp Route
    warpDeploymentPath = getCombinedWarpRoutePath(tokenSymbol, [
      CHAIN_NAME_2,
      CHAIN_NAME_3,
      CHAIN_NAME_4,
    ]);
    const ownerAddress = new Wallet(ANVIL_KEY).address;
    const warpConfig: WarpRouteDeployConfig = {
      [CHAIN_NAME_2]: {
        type: TokenType.collateral,
        token: tokenChain2.address,
        mailbox: chain2Addresses.mailbox,
        owner: ownerAddress,
      },
      [CHAIN_NAME_3]: {
        type: TokenType.collateral,
        token: tokenChain3.address,
        mailbox: chain3Addresses.mailbox,
        owner: ownerAddress,
      },
      [CHAIN_NAME_4]: {
        type: TokenType.synthetic,
        mailbox: chain4Addresses.mailbox,
        owner: ownerAddress,
      },
    };
    writeYamlOrJson(warpDeploymentPath, warpConfig);
    await hyperlaneWarpDeploy(warpDeploymentPath);

    warpRouteId = createWarpRouteConfigId(tokenSymbol.toUpperCase(), [
      CHAIN_NAME_2,
      CHAIN_NAME_3,
      CHAIN_NAME_4,
    ]);

    $.verbose = ogVerbose;
  });

  beforeEach(async () => {
    process = undefined;

    snapshot1 = await createSnapshot('http://localhost:8555');
    snapshot2 = await createSnapshot('http://localhost:8600');
    snapshot3 = await createSnapshot('http://localhost:8601');
  });

  afterEach(async () => {
    if (process) {
      await process.kill();
    }

    await restoreSnapshot('http://localhost:8555', snapshot1);
    await restoreSnapshot('http://localhost:8600', snapshot2);
    await restoreSnapshot('http://localhost:8601', snapshot3);
  });

  it('should successfuly start the rebalancer', async () => {
    process = hyperlaneWarpRebalancer(warpRouteId, CHECK_FREQUENCY);

    for await (const chunk of process.stdout) {
      if (chunk.includes('Rebalancer started successfully 🚀')) {
        break;
      }
    }
  });

  describe('with no balance on collateral contracts', () => {
    it('should report an empty array of routes being executed', async () => {
      process = hyperlaneWarpRebalancer(warpRouteId, CHECK_FREQUENCY);

      for await (const chunk of process.stdout) {
        if (chunk.includes('Executing rebalancing routes: []')) {
          break;
        }
      }
    });
  });

  describe('with the same balance on all collateral contracts', () => {
    beforeEach(async () => {
      const ogVerbose = $.verbose;
      $.verbose = false;

      await Promise.all([
        hyperlaneWarpSendRelay(
          CHAIN_NAME_2,
          CHAIN_NAME_4,
          warpDeploymentPath,
          true,
          toWei(50),
        ),
        hyperlaneWarpSendRelay(
          CHAIN_NAME_3,
          CHAIN_NAME_4,
          warpDeploymentPath,
          true,
          toWei(50),
        ),
      ]);

      $.verbose = ogVerbose;
    });

    it('should report an empty array of routes being executed', async () => {
      process = hyperlaneWarpRebalancer(warpRouteId, CHECK_FREQUENCY);

      for await (const chunk of process.stdout) {
        if (chunk.includes('Executing rebalancing routes: []')) {
          break;
        }
      }
    });
  });

  describe('with different balances on collateral contracts', () => {
    beforeEach(async () => {
      const ogVerbose = $.verbose;
      $.verbose = false;

      await Promise.all([
        hyperlaneWarpSendRelay(
          CHAIN_NAME_2,
          CHAIN_NAME_4,
          warpDeploymentPath,
          true,
          toWei(30),
        ),
        hyperlaneWarpSendRelay(
          CHAIN_NAME_3,
          CHAIN_NAME_4,
          warpDeploymentPath,
          true,
          toWei(70),
        ),
      ]);

      $.verbose = ogVerbose;
    });

    it('should report an array of routes being executed', async () => {
      process = hyperlaneWarpRebalancer(warpRouteId, CHECK_FREQUENCY);

      for await (const chunk of process.stdout) {
        if (
          chunk.includes(
            `Executing rebalancing routes: [
  {
    fromChain: 'anvil3',
    toChain: 'anvil2',
    amount: 20000000000000000000n
  }
]`,
          )
        ) {
          break;
        }
      }
    });
  });
});
