import { connectorSessionGuard, type ConnectorSession } from '@logto/connector-kit';
import { z } from 'zod';

import { type ToZodObject } from '../../utils/zod.js';
import { encryptedTokenSetGuard, type EncryptedTokenSet } from '../secrets.js';
import { extendedSocialUserInfoGuard, type ExtendedSocialUserInfo } from '../sso-connector.js';

import { VerificationType } from './verification-type.js';

/** The JSON data type for the EnterpriseSsoVerification record stored in the interaction storage */
export type EnterpriseSsoVerificationRecordData = {
  id: string;
  connectorId: string;
  type: VerificationType.EnterpriseSso;
  /**
   * The enterprise SSO identity returned by the connector.
   */
  enterpriseSsoUserInfo?: ExtendedSocialUserInfo;
  encryptedTokenSet?: EncryptedTokenSet;
  issuer?: string;
  /**
   * The enterprise SSO connector session result
   */
  connectorSession?: ConnectorSession;
};

export const enterpriseSsoVerificationRecordDataGuard = z.object({
  id: z.string(),
  connectorId: z.string(),
  type: z.literal(VerificationType.EnterpriseSso),
  enterpriseSsoUserInfo: extendedSocialUserInfoGuard.optional(),
  encryptedTokenSet: encryptedTokenSetGuard.optional(),
  issuer: z.string().optional(),
  connectorSession: connectorSessionGuard.optional(),
}) satisfies ToZodObject<EnterpriseSsoVerificationRecordData>;

export type SanitizedEnterpriseSsoVerificationRecordData = Omit<
  EnterpriseSsoVerificationRecordData,
  'encryptedTokenSet' | 'connectorSession'
>;

export const sanitizedEnterpriseSsoVerificationRecordDataGuard =
  enterpriseSsoVerificationRecordDataGuard.omit({
    encryptedTokenSet: true,
    connectorSession: true,
  }) satisfies ToZodObject<SanitizedEnterpriseSsoVerificationRecordData>;
