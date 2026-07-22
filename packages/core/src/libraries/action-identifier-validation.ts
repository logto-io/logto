import { SignInIdentifier, type ActionUserPatch, type InteractionIdentifier } from '@logto/schemas';
import { PhoneNumberParser } from '@logto/shared/universal';

const signInIdentifierToUserField = {
  [SignInIdentifier.Email]: 'primaryEmail',
  [SignInIdentifier.Phone]: 'primaryPhone',
  [SignInIdentifier.Username]: 'username',
} as const satisfies Record<SignInIdentifier, keyof ActionUserPatch>;

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

export const doesActionPreserveSignInIdentifier = (
  identifier: InteractionIdentifier,
  userPatch: ActionUserPatch
) => {
  const field = signInIdentifierToUserField[identifier.type];
  const returned = userPatch[field];

  return (
    returned === undefined ||
    (typeof returned === 'string' &&
      isSameSignInIdentifierValue(identifier.type, identifier.value, returned))
  );
};
