import { z } from 'zod';

import { type ToZodObject } from '../../utils/zod.js';

import { VerificationType } from './verification-type.js';

/** The JSON data type for the GoogleOneTapVerification record stored in the interaction storage */
export type GoogleOneTapVerificationRecordData = {
  id: string;
  type: VerificationType.GoogleOneTap;
  /**
   * The Google ID token credential
   */
  credential?: string;
  /**
   * Whether the verification has been completed
   */
  verified: boolean;
  /**
   * The email extracted from the verified Google ID token
   */
  email?: string;
  /**
   * The user ID extracted from the verified Google ID token
   */
  googleUserId?: string;
  /**
   * The name extracted from the verified Google ID token
   */
  name?: string;
  /**
   * The avatar URL extracted from the verified Google ID token
   */
  avatar?: string;
};

export const googleOneTapVerificationRecordDataGuard = z.object({
  id: z.string(),
  type: z.literal(VerificationType.GoogleOneTap),
  credential: z.string().optional(),
  verified: z.boolean(),
  email: z.string().optional(),
  googleUserId: z.string().optional(),
  name: z.string().optional(),
  avatar: z.string().optional(),
}) satisfies ToZodObject<GoogleOneTapVerificationRecordData>;

/** The payload for verifying a Google One Tap credential */
export type GoogleOneTapVerificationVerifyPayload = {
  credential: string;
};

export const googleOneTapVerificationVerifyPayloadGuard = z.object({
  credential: z.string(),
}) satisfies ToZodObject<GoogleOneTapVerificationVerifyPayload>;
