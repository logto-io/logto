import {
  type PostFirstFactorVerificationEvent,
  type HookUserPatch,
  type InteractionIdentifier,
  postFirstFactorVerificationResultGuard,
  postSignInResultGuard,
} from '@logto/schemas';
import { isPlainObject } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import { doesInlineHookPreserveSignInIdentifier } from '#src/libraries/inline-hook-identifier-validation.js';
import assertThat from '#src/utils/assert-that.js';

import { type HookProvisioningProfile } from '../../types.js';

import { toHookProvisioningProfile } from './inline-hook-provisioning-profile.js';

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

const isInlineHookResultObject = (result: unknown): result is Record<string, unknown> =>
  isPlainObject(result);

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
    // eslint-disable-next-line unicorn/no-useless-undefined -- explicit undefined; bare `return` trips no-useless-return
    return undefined;
  }
};

const assertHookPreservesSignInIdentifier = (
  identifier: InteractionIdentifier,
  userPatch: HookUserPatch
) => {
  assertThat(
    doesInlineHookPreserveSignInIdentifier(identifier, userPatch),
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
  const parsed = postFirstFactorVerificationResultGuard.safeParse(result);

  if (!parsed.success) {
    return invalidCredentialsResult();
  }

  const profile = toHookProvisioningProfileSafe(parsed.data.user);

  if (!profile) {
    return invalidCredentialsResult();
  }

  assertHookPreservesSignInIdentifier(event.identifier, profile);

  switch (parsed.data.action) {
    case 'createUser': {
      assertThat(event.user === null, identityConflictError());

      return {
        action: 'createUser',
        user: profile,
      };
    }
    case 'updateUser': {
      assertThat(event.user, identityConflictError());

      return {
        action: 'updateUser',
        userId: event.user.id,
        user: profile,
      };
    }
  }
};

export const validatePostSignInHookResult = ({
  userId,
  result,
}: {
  userId: string;
  result: unknown;
}): ValidatedPostSignInHookResult => {
  if (result === null || result === undefined) {
    return continueResult();
  }

  if (!isInlineHookResultObject(result)) {
    throw verificationFailedError();
  }

  if (Object.keys(result).length === 0) {
    return continueResult();
  }

  const parsed = postSignInResultGuard.safeParse(result);

  assertThat(parsed.success, verificationFailedError());

  switch (parsed.data.action) {
    case 'updateUser': {
      if (parsed.data.user === undefined) {
        return continueResult();
      }

      const profile = toHookProvisioningProfileSafe(parsed.data.user);

      assertThat(profile, verificationFailedError());

      return {
        action: 'updateUser',
        userId,
        user: profile,
      };
    }
  }
};
