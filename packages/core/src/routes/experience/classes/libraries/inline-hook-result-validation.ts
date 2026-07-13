import {
  type PostFirstFactorVerificationEvent,
  type PostSignInEvent,
  SignInIdentifier,
  type HookUserPatch,
  type InteractionIdentifier,
  postFirstFactorVerificationResultGuard,
  postSignInResultGuard,
} from '@logto/schemas';
import { PhoneNumberParser } from '@logto/shared/universal';

import RequestError from '#src/errors/RequestError/index.js';
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
    // eslint-disable-next-line unicorn/no-useless-undefined -- explicit undefined; bare `return` trips no-useless-return
    return undefined;
  }
};

const signInIdentifierToUserField = {
  [SignInIdentifier.Email]: 'primaryEmail',
  [SignInIdentifier.Phone]: 'primaryPhone',
  [SignInIdentifier.Username]: 'username',
} as const satisfies Record<SignInIdentifier, keyof HookUserPatch>;

const isSameSignInIdentifierValue = (
  type: SignInIdentifier,
  submitted: string,
  returned: string
): boolean => {
  switch (type) {
    case SignInIdentifier.Email: {
      return submitted.toLowerCase() === returned.toLowerCase();
    }
    case SignInIdentifier.Phone: {
      const submittedPhone = new PhoneNumberParser(submitted);
      const returnedPhone = new PhoneNumberParser(returned);

      if (
        submittedPhone.isValid &&
        returnedPhone.isValid &&
        submittedPhone.internationalNumber &&
        returnedPhone.internationalNumber
      ) {
        return submittedPhone.internationalNumber === returnedPhone.internationalNumber;
      }

      return submitted === returned;
    }
    case SignInIdentifier.Username: {
      return submitted === returned;
    }
  }
};

const assertHookPreservesSignInIdentifier = (
  identifier: InteractionIdentifier,
  userPatch: HookUserPatch
) => {
  const field = signInIdentifierToUserField[identifier.type];
  const returned = userPatch[field];

  assertThat(
    returned === undefined ||
      (typeof returned === 'string' &&
        isSameSignInIdentifierValue(identifier.type, identifier.value, returned)),
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
  event,
  result,
}: {
  event: Pick<PostSignInEvent, 'user'>;
  result: unknown;
}): ValidatedPostSignInHookResult => {
  if (result === null || result === undefined) {
    return continueResult();
  }

  if (!isInlineHookResultObject(result)) {
    throw verificationFailedError();
  }

  const { action, user } = result;

  if (action === undefined && user === undefined) {
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
        userId: event.user.id,
        user: profile,
      };
    }
  }
};
