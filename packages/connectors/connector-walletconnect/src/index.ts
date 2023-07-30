import type {
  CreateConnector,
  GenerateNonce,
  GetConnectorConfig,
  BlockchainConnector,
  VerifyMessage,
} from '@logto/connector-kit';
import { ConnectorType } from '@logto/connector-kit';
import { verifyMessage as ethersVerify } from 'ethers';

import { defaultMetadata } from './constant.js';
import { walletConnectConfigGuard } from './types.js';

// TODO: @lbennett use these instead of default
const generateNonce = (getConfig: GetConnectorConfig): GenerateNonce => {
  return async (): Promise<string> => {
    return 'wow!';
  };
};

// TODO: @lbennett use these istead of default
const verifyMessage = (getConfig: GetConnectorConfig): VerifyMessage => {
  return async (message: string, signature: string): Promise<string> => {
    return ethersVerify(message, signature);
  };
};

const createWalletConnectConnector: CreateConnector<BlockchainConnector> = async ({
  getConfig,
}) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Blockchain,
    configGuard: walletConnectConfigGuard,
    generateNonce: generateNonce(getConfig),
    verifyMessage: verifyMessage(getConfig),
    // SignMessage,
  };
};

export default createWalletConnectConnector;
