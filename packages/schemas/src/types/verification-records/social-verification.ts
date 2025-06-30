import {
  connectorSessionGuard,
  socialUserInfoGuard,
  type ConnectorSession,
  type SocialUserInfo,
  tokenResponseGuard,
} from '@logto/connector-kit';
import { z } from 'zod';

import { type ToZodObject } from '../../utils/zod.js';
import { encryptedTokenSetGuard, type EncryptedTokenSet } from '../secrets.js';

import { VerificationType } from './verification-type.js';

/** The JSON data type for the SocialVerification record stored in the interaction storage */
export type SocialVerificationRecordData = {
  id: string;
  connectorId: string;
  type: VerificationType.Social;
  /**
   * The social identity returned by the connector.
   */
  socialUserInfo?: SocialUserInfo;
  encryptedTokenSet?: EncryptedTokenSet;
  /**
   * The connector session result
   */
  connectorSession?: ConnectorSession;
};

export const socialVerificationRecordDataGuard = z.object({
  id: z.string(),
  connectorId: z.string(),
  type: z.literal(VerificationType.Social),
  socialUserInfo: socialUserInfoGuard.optional(),
  encryptedTokenSet: encryptedTokenSetGuard.optional(),
  tokenResponse: tokenResponseGuard.optional(),
  connectorSession: connectorSessionGuard.optional(),
}) satisfies ToZodObject<SocialVerificationRecordData>;
