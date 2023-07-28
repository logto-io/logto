import type {
  CreateConnector,
  GenerateNonce,
  GetConnectorConfig,
  BlockchainConnector,
  Verify,
  BlockchainUserInfo,
} from '@logto/connector-kit';
import { ConnectorType } from '@logto/connector-kit';

import { defaultMetadata } from './constant.js';
import { metaMaskConfigGuard } from './types.js';

// TODO: @lbennett use these instead of default
const generateNonce = (getConfig: GetConnectorConfig): GenerateNonce => {
  return async (): Promise<string> => {
    return 'my-nonce';
  };
};

// TODO: @lbennett use these istead of default
const verify = (getConfig: GetConnectorConfig): Verify => {
  return async (): Promise<BlockchainUserInfo> => {
    return {
      address: 'my-wallet-address',
    };
  };
};

const createMetaMaskConnector: CreateConnector<BlockchainConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Blockchain,
    configGuard: metaMaskConfigGuard,
    generateNonce: generateNonce(getConfig),
    verify: verify(getConfig),
  };
};

export default createMetaMaskConnector;
