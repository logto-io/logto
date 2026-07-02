import {
  hookProvisioningProfileGuard,
  type HookProvisioningProfile,
  type PostFirstFactorVerificationEvent,
  type PostSignInEvent,
} from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

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

const toHookProvisioningProfile = (user: unknown) => {
  const result = hookProvisioningProfileGuard.safeParse(user);

  return result.success ? result.data : undefined;
};

export const validatePostFirstFactorVerificationHookResult = ({
  event,
  result,
}: {
  event: Pick<PostFirstFactorVerificationEvent, 'user'>;
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

  const profile = toHookProvisioningProfile(user);

  if (!profile) {
    return invalidCredentialsResult();
  }

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

  const profile = toHookProvisioningProfile(user);

  assertThat(profile, verificationFailedError());

  return {
    action,
    userId: event.user.id,
    user: profile,
  };
};
