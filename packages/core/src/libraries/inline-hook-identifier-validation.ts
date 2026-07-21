import { SignInIdentifier, type HookUserPatch, type InteractionIdentifier } from '@logto/schemas';
import { PhoneNumberParser } from '@logto/shared/universal';

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

export const doesInlineHookPreserveSignInIdentifier = (
  identifier: InteractionIdentifier,
  userPatch: HookUserPatch
) => {
  const field = signInIdentifierToUserField[identifier.type];
  const returned = userPatch[field];

  return (
    returned === undefined ||
    (typeof returned === 'string' &&
      isSameSignInIdentifierValue(identifier.type, identifier.value, returned))
  );
};
