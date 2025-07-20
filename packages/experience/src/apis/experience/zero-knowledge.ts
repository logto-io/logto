/**
 * Zero-knowledge encryption specific API functions.
 * These handle the custom flow for password sign-in and registration with secret management.
 */

import { InteractionEvent, type PasswordVerificationPayload } from '@logto/schemas';

import api from '../api';

import { experienceApiRoutes, type PasswordVerificationResponse } from './const';
import { initInteraction, identifyUser, submitInteraction } from './interaction';

/**
 * Custom sign-in flow for zero-knowledge encryption.
 * This separates the verification and submission steps to allow
 * secret management in between.
 */
export const signInWithPasswordAndManageSecret = async (
  payload: PasswordVerificationPayload,
  captchaToken?: string,
  onSecretManagement?: (
    verificationId: string,
    encryptedSecret: string | undefined
  ) => Promise<void>
) => {
  // Step 1: Initialize the interaction
  await initInteraction(InteractionEvent.SignIn, captchaToken);

  // Step 2: Verify the password

  const passwordVerificationResponse = await api
    .post(`${experienceApiRoutes.verification}/password`, {
      json: payload,
    })
    .json<PasswordVerificationResponse>();

  const { verificationId, encryptedSecret } = passwordVerificationResponse;

  // Step 3: Identify the user
  await identifyUser({ verificationId });

  // Step 4: Handle secret management if callback provided
  if (onSecretManagement) {
    try {
      await onSecretManagement(verificationId, encryptedSecret ?? undefined);
    } catch {
      // Continue with the flow even if secret management fails
    }
  }

  // Step 5: Submit the interaction
  const submitResult = await submitInteraction();

  return {
    ...submitResult,
    verificationId,
    encryptedSecret,
  };
};
