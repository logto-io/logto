import {
  type PostFirstFactorVerificationEvent,
  type ActionUserPatch,
  type InteractionIdentifier,
  postFirstFactorVerificationResultGuard,
  postSignInResultGuard,
} from '@logto/schemas';
import { isPlainObject } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import { doesActionPreserveSignInIdentifier } from '#src/libraries/action-identifier-validation.js';
import assertThat from '#src/utils/assert-that.js';

import { type ActionProvisioningProfile } from '../../types.js';

import { toActionProvisioningProfile } from './action-provisioning-profile.js';

type ActionRejectInvalidCredentialsResult = {
  action: 'rejectInvalidCredentials';
};

export type ValidatedPostFirstFactorVerificationActionResult =
  | ActionRejectInvalidCredentialsResult
  | {
      action: 'createUser';
      user: ActionProvisioningProfile;
    }
  | {
      action: 'updateUser';
      userId: string;
      user: ActionProvisioningProfile;
    };

export type ValidatedPostSignInActionResult =
  | {
      action: 'continue';
    }
  | {
      action: 'updateUser';
      userId: string;
      user: ActionProvisioningProfile;
    };

const isActionResultObject = (result: unknown): result is Record<string, unknown> =>
  isPlainObject(result);

const invalidCredentialsResult = (): ActionRejectInvalidCredentialsResult => ({
  action: 'rejectInvalidCredentials',
});

const continueResult = (): ValidatedPostSignInActionResult => ({
  action: 'continue',
});

const identityConflictError = () =>
  new RequestError({ code: 'session.identity_conflict', status: 409 });

const verificationFailedError = () =>
  new RequestError({ code: 'session.verification_failed', status: 400 });

const toActionProvisioningProfileSafe = (user: unknown) => {
  try {
    return toActionProvisioningProfile(user);
  } catch {
    // eslint-disable-next-line unicorn/no-useless-undefined -- explicit undefined; bare `return` trips no-useless-return
    return undefined;
  }
};

const assertActionPreservesSignInIdentifier = (
  identifier: InteractionIdentifier,
  userPatch: ActionUserPatch
) => {
  assertThat(
    doesActionPreserveSignInIdentifier(identifier, userPatch),
    new RequestError(
      { code: 'action.sign_in_identifier_changed', status: 422 },
      { identifierType: identifier.type }
    )
  );
};

export const validatePostFirstFactorVerificationActionResult = ({
  event,
  result,
}: {
  event: Pick<PostFirstFactorVerificationEvent, 'user' | 'identifier'>;
  result: unknown;
}): ValidatedPostFirstFactorVerificationActionResult => {
  const parsed = postFirstFactorVerificationResultGuard.safeParse(result);

  if (!parsed.success) {
    return invalidCredentialsResult();
  }

  const profile = toActionProvisioningProfileSafe(parsed.data.user);

  if (!profile) {
    return invalidCredentialsResult();
  }

  assertActionPreservesSignInIdentifier(event.identifier, profile);

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

export const validatePostSignInActionResult = ({
  userId,
  result,
}: {
  userId: string;
  result: unknown;
}): ValidatedPostSignInActionResult => {
  if (result === null || result === undefined) {
    return continueResult();
  }

  if (!isActionResultObject(result)) {
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

      const profile = toActionProvisioningProfileSafe(parsed.data.user);

      assertThat(profile, verificationFailedError());

      return {
        action: 'updateUser',
        userId,
        user: profile,
      };
    }
  }
};
