import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Hex } from 'viem';
import { PoolV4Config, Addresses } from '../../configs/types';

interface DeployJson {
  accessManager: Hex;
  configPositionManager: Hex;
  giverPositionManager: Hex;
  hub: Record<string, Hex>;
  hubConfigurator: Hex;
  irStrategy: Record<string, Hex>;
  nativeTokenGateway: Hex;
  oracle: Record<string, Hex>;
  signatureGateway: Hex;
  spoke: Record<string, Hex>;
  spokeConfigurator: Hex;
  takerPositionManager: Hex;
  treasurySpoke: Hex;
}

// TokenizationSpoke deploy: { HUB_NAME: { ASSET_SYMBOL: address } }
type TokenizationDeployJson = Record<string, Record<string, Hex>>;

export function fetchV4Addresses(poolConfig: PoolV4Config): Addresses {
  const raw = readFileSync(resolve(process.cwd(), poolConfig.deployJson), 'utf-8');
  const deploy: DeployJson = JSON.parse(raw);

  // Order matches devnet.json structure
  const addresses: Addresses = {};

  addresses.ACCESS_MANAGER = deploy.accessManager;
  addresses.CONFIG_POSITION_MANAGER = deploy.configPositionManager;
  addresses.GIVER_POSITION_MANAGER = deploy.giverPositionManager;

  // Hubs
  for (const [key, value] of Object.entries(deploy.hub)) {
    addresses[key] = value;
  }

  addresses.HUB_CONFIGURATOR = deploy.hubConfigurator;

  // IR strategies (per hub)
  for (const [key, value] of Object.entries(deploy.irStrategy)) {
    addresses[`${key}_IR_STRATEGY`] = value;
  }

  addresses.NATIVE_TOKEN_GATEWAY = deploy.nativeTokenGateway;

  // Oracles (per spoke)
  for (const [key, value] of Object.entries(deploy.oracle)) {
    addresses[`${key}_ORACLE`] = value;
  }

  addresses.SIGNATURE_GATEWAY = deploy.signatureGateway;

  // Spokes
  for (const [key, value] of Object.entries(deploy.spoke)) {
    addresses[key] = value;
  }

  addresses.SPOKE_CONFIGURATOR = deploy.spokeConfigurator;
  addresses.TAKER_POSITION_MANAGER = deploy.takerPositionManager;
  addresses.TREASURY_SPOKE = deploy.treasurySpoke;

  // Tokenization spokes (optional separate deploy file)
  if (poolConfig.tokenizationDeployJson) {
    const tokenRaw = readFileSync(resolve(process.cwd(), poolConfig.tokenizationDeployJson), 'utf-8');
    const tokenDeploy: TokenizationDeployJson = JSON.parse(tokenRaw);
    for (const [hubName, assets] of Object.entries(tokenDeploy)) {
      for (const [asset, addr] of Object.entries(assets)) {
        addresses[`TOKENIZATION_${hubName}_${asset}`] = addr;
      }
    }
  }

  return addresses;
}
