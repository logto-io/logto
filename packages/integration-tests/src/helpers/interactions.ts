import type {
  EmailPasswordPayload,
  PhonePasswordPayload,
  UsernamePasswordPayload,
} from '@logto/schemas';
import { InteractionEvent, SignInIdentifier } from '@logto/schemas';

import { generateUserId } from '#src/utils.js';

import { initExperienceClient, logoutClient, processSession } from './client.js';
import {
  successfullyCreateSocialVerification,
  successfullyVerifySocialAuthorization,
} from './experience/social-verification.js';
import {
  successfullySendVerificationCode,
  successfullyVerifyVerificationCode,
} from './experience/verification-code.js';
import { expectRejects } from './index.js';
import { enableAllPasswordSignInMethods } from './sign-in-experience.js';
import { generateNewUser } from './user.js';

const parseIdentifier = (
  payload: UsernamePasswordPayload | EmailPasswordPayload | PhonePasswordPayload
) => {
  if ('username' in payload) {
    return {
      identifier: { type: SignInIdentifier.Username, value: payload.username },
      password: payload.password,
    };
  }

  if ('email' in payload) {
    return {
      identifier: { type: SignInIdentifier.Email, value: payload.email },
      password: payload.password,
    };
  }

  return {
    identifier: { type: SignInIdentifier.Phone, value: payload.phone },
    password: payload.password,
  };
};

export const registerNewUser = async (username: string, password: string) => {
  const client = await initExperienceClient({ interactionEvent: InteractionEvent.Register });

  await client.updateProfile({ type: SignInIdentifier.Username, value: username });
  await client.updateProfile({ type: 'password', value: password });
  await client.identifyUser();

  const { redirectTo } = await client.submitInteraction();
  const userId = await processSession(client, redirectTo);
  await logoutClient(client);
  return userId;
};

/**
 * Register a new user with email and verification code. Email connector must be enabled.
 *
 * @param email The email address of the user to register.
 * @returns The client and the user ID.
 */
export const registerWithEmail = async (email: string) => {
  const client = await initExperienceClient({ interactionEvent: InteractionEvent.Register });

  const identifier = { type: SignInIdentifier.Email, value: email } as const;
  const { verificationId, code } = await successfullySendVerificationCode(client, {
    identifier,
    interactionEvent: InteractionEvent.Register,
  });

  await successfullyVerifyVerificationCode(client, {
    identifier,
    verificationId,
    code,
  });

  await client.identifyUser({ verificationId });

  const { redirectTo } = await client.submitInteraction();
  const id = await processSession(client, redirectTo);

  return { client, id };
};

export const signInWithEmail = async (email: string) => {
  const client = await initExperienceClient();

  const identifier = { type: SignInIdentifier.Email, value: email } as const;
  const { verificationId, code } = await successfullySendVerificationCode(client, {
    identifier,
    interactionEvent: InteractionEvent.SignIn,
  });

  await successfullyVerifyVerificationCode(client, {
    identifier,
    verificationId,
    code,
  });

  await client.identifyUser({ verificationId });

  const { redirectTo } = await client.submitInteraction();
  const id = await processSession(client, redirectTo);
  return { client, id };
};

export const signInWithPassword = async (
  payload: UsernamePasswordPayload | EmailPasswordPayload | PhonePasswordPayload
) => {
  const client = await initExperienceClient();
  const passwordPayload = parseIdentifier(payload);

  const { verificationId } = await client.verifyPassword(passwordPayload);
  await client.identifyUser({ verificationId });

  const { redirectTo } = await client.submitInteraction();

  await processSession(client, redirectTo);
  await logoutClient(client);
};

export const createNewSocialUserWithUsernameAndPassword = async (connectorId: string) => {
  const state = 'foo_state';
  const redirectUri = 'http://foo.dev/callback';
  const code = 'auth_code_foo';
  const socialUserId = generateUserId();

  const {
    userProfile: { username, password },
  } = await generateNewUser({ username: true, password: true });

  await enableAllPasswordSignInMethods();

  const client = await initExperienceClient();

  const { verificationId } = await successfullyCreateSocialVerification(client, connectorId, {
    redirectUri,
    state,
  });

  await successfullyVerifySocialAuthorization(client, connectorId, {
    verificationId,
    connectorData: { state, redirectUri, code, userId: socialUserId },
  });

  await expectRejects(client.identifyUser({ verificationId }), {
    code: 'user.identity_not_exist',
    status: 404,
  });

  await client.updateInteractionEvent({ interactionEvent: InteractionEvent.Register });

  await expectRejects(client.identifyUser({ verificationId }), {
    code: 'user.missing_profile',
    status: 422,
  });

  await client.updateProfile({ type: SignInIdentifier.Username, value: username });
  await client.updateProfile({ type: 'password', value: password });
  await client.updateProfile({ type: 'social', verificationId });
  await client.identifyUser();

  const { redirectTo } = await client.submitInteraction();

  return processSession(client, redirectTo);
};

export const signInWithUsernamePasswordAndUpdateEmailOrPhone = async (
  username: string,
  password: string,
  profile: { email: string } | { phone: string }
) => {
  const client = await initExperienceClient();

  const { verificationId: passwordVerificationId } = await client.verifyPassword({
    identifier: {
      type: SignInIdentifier.Username,
      value: username,
    },
    password,
  });

  await expectRejects(client.identifyUser({ verificationId: passwordVerificationId }), {
    code: 'user.missing_profile',
    status: 422,
  });

  const identifier =
    'email' in profile
      ? ({ type: SignInIdentifier.Email, value: profile.email } as const)
      : ({ type: SignInIdentifier.Phone, value: profile.phone } as const);

  const { verificationId, code } = await successfullySendVerificationCode(client, {
    identifier,
    interactionEvent: InteractionEvent.SignIn,
  });

  await successfullyVerifyVerificationCode(client, {
    identifier,
    verificationId,
    code,
  });

  await client.updateProfile({
    type: identifier.type,
    verificationId,
  });

  await client.identifyUser();

  const { redirectTo } = await client.submitInteraction();

  await processSession(client, redirectTo);
  await logoutClient(client);
};

export const resetPassword = async (
  profile: { email: string } | { phone: string },
  newPassword: string
) => {
  const client = await initExperienceClient({ interactionEvent: InteractionEvent.ForgotPassword });

  const identifier =
    'email' in profile
      ? ({ type: SignInIdentifier.Email, value: profile.email } as const)
      : ({ type: SignInIdentifier.Phone, value: profile.phone } as const);

  const { verificationId, code } = await successfullySendVerificationCode(client, {
    identifier,
    interactionEvent: InteractionEvent.ForgotPassword,
  });

  await successfullyVerifyVerificationCode(client, {
    identifier,
    verificationId,
    code,
  });

  await client.identifyUser({ verificationId });
  await client.resetPassword({ password: newPassword });
  await client.submitInteraction();
};
