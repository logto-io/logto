import {
  type PostFirstFactorVerificationEvent,
  type PostSignInEvent,
  SignInIdentifier,
  type HookUserPatch,
  type InteractionIdentifier,
} from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

import { type HookProvisioningProfile } from '../../types.js';

import { toHookProvisioningProfile } from './inline-hook-provisioning-profile.js';

type InlineHookResultObject = {
  action?: unknown;
  passwordVerified?: unknown;
  user?: unknown;
};

type InlineHookRejectInvalidCredentialsResult = {
  action: 'rejectInvalidCredentials';
};

export type ValidatedPostFirstFactorVerificationHookResult =
  | InlineHookRejectInvalidCredentialsResult
  | {
      action: 'createUser';
      user: HookProvisioningProfile;
    }
  | {
      action: 'updateUser';
      userId: string;
      user: HookProvisioningProfile;
    };

export type ValidatedPostSignInHookResult =
  | {
      action: 'continue';
    }
  | {
      action: 'updateUser';
      userId: string;
      user: HookProvisioningProfile;
    };

const isInlineHookResultObject = (result: unknown): result is InlineHookResultObject =>
  typeof result === 'object' && result !== null && !Array.isArray(result);

const invalidCredentialsResult = (): InlineHookRejectInvalidCredentialsResult => ({
  action: 'rejectInvalidCredentials',
});

const continueResult = (): ValidatedPostSignInHookResult => ({
  action: 'continue',
});

const identityConflictError = () =>
  new RequestError({ code: 'session.identity_conflict', status: 409 });

const verificationFailedError = () =>
  new RequestError({ code: 'session.verification_failed', status: 400 });

const toHookProvisioningProfileSafe = (user: unknown) => {
  try {
    return toHookProvisioningProfile(user);
  } catch {
    // eslint-disable-next-line unicorn/no-useless-undefined
    return undefined;
  }
};

const signInIdentifierToUserField = {
  [SignInIdentifier.Email]: 'primaryEmail',
  [SignInIdentifier.Phone]: 'primaryPhone',
  [SignInIdentifier.Username]: 'username',
} as const satisfies Record<SignInIdentifier, keyof HookUserPatch>;

const assertHookPreservesSignInIdentifier = (
  identifier: InteractionIdentifier,
  userPatch: HookUserPatch
) => {
  const field = signInIdentifierToUserField[identifier.type];
  const returned = userPatch[field];

  assertThat(
    returned === undefined || returned === identifier.value,
    new RequestError(
      { code: 'inline_hook.sign_in_identifier_changed', status: 422 },
      { identifierType: identifier.type }
    )
  );
};

export const validatePostFirstFactorVerificationHookResult = ({
  event,
  result,
}: {
  event: Pick<PostFirstFactorVerificationEvent, 'user' | 'identifier'>;
  result: unknown;
}): ValidatedPostFirstFactorVerificationHookResult => {
  if (!isInlineHookResultObject(result)) {
    return invalidCredentialsResult();
  }

  const { action, passwordVerified, user } = result;

  if (
    (action !== 'createUser' && action !== 'updateUser') ||
    user === undefined ||
    passwordVerified !== true
  ) {
    return invalidCredentialsResult();
  }

  const profile = toHookProvisioningProfileSafe(user);

  if (!profile) {
    return invalidCredentialsResult();
  }

  assertHookPreservesSignInIdentifier(event.identifier, profile);

  if (action === 'createUser') {
    assertThat(event.user === null, identityConflictError());

    return {
      action,
      user: profile,
    };
  }

  assertThat(event.user, identityConflictError());

  return {
    action,
    userId: event.user.id,
    user: profile,
  };
};

export const validatePostSignInHookResult = ({
  event,
  result,
}: {
  event: Pick<PostSignInEvent, 'user'>;
  result: unknown;
}): ValidatedPostSignInHookResult => {
  if (result === null || result === undefined) {
    return continueResult();
  }

  assertThat(isInlineHookResultObject(result), verificationFailedError());

  const { action, user } = result;

  if (action === undefined && user === undefined) {
    return continueResult();
  }

  assertThat(action === 'updateUser', verificationFailedError());

  if (user === undefined) {
    return continueResult();
  }

  const profile = toHookProvisioningProfileSafe(user);

  assertThat(profile, verificationFailedError());

  return {
    action,
    userId: event.user.id,
    user: profile,
  };
};
