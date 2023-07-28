import { z } from 'zod';

import {
  type ConnectorType,
  type BaseConnector,
  type SetSession,
  type GetSession,
} from './types.js';

export type GenerateNonce = (payload: unknown, setSession: SetSession) => Promise<string>;

export type Verify = (
  data: string,
  getSession: GetSession
) => Promise<BlockchainUserInfo & Record<string, string | boolean | number | undefined>>;

export type BlockchainConnector = BaseConnector<ConnectorType.Blockchain> & {
  generateNonce: GenerateNonce;
  verify: Verify;
};

export const blockchainUserInfoGuard = z.object({
  address: z.string(),
});

export type BlockchainUserInfo = z.infer<typeof blockchainUserInfoGuard>;
