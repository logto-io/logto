import { type FC } from 'react';
import { z } from 'zod';

import { type ConnectorType, type BaseConnector } from './types.js';

export type GenerateNonce = () => Promise<string>;

export type SignMessage = (message: string) => Promise<{ address: string; signature: string }>;

export type VerifyMessage = (message: string, signature: string) => Promise<string>;

export type BlockchainConnector = BaseConnector<ConnectorType.Blockchain> & {
  generateNonce: GenerateNonce;
  verifyMessage: VerifyMessage;
};

export type BlockchainConnectorClient = BaseConnector<ConnectorType.Blockchain> & {
  signMessage: SignMessage;
};

export const blockchainUserInfoGuard = z.object({
  address: z.string(),
});

export type BlockchainUserInfo = z.infer<typeof blockchainUserInfoGuard>;

export type ConnectorSignInButtonProperties = {
  onClick: () => void;
};

export type BlockchainConnectorSignInButtonProperties = {
  children: FC<ConnectorSignInButtonProperties>;
  onSigned: (payload: { address: string; signature: string }) => void;
};
