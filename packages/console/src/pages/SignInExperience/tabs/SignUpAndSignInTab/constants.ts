import { SignUpIdentifier, SignInIdentifier } from '@logto/schemas';

export const signUpIdentifiers = Object.values(SignUpIdentifier);

export const signInIdentifiers = Object.values(SignInIdentifier);

export const requireVerifySignUpIdentifiers = [
  SignUpIdentifier.Email,
  SignUpIdentifier.Phone,
  SignUpIdentifier.EmailOrPhone,
];

export const signUpToSignInIdentifierMapping: { [key in SignUpIdentifier]: SignInIdentifier[] } = {
  [SignUpIdentifier.Username]: [SignInIdentifier.Username],
  [SignUpIdentifier.Email]: [SignInIdentifier.Email],
  [SignUpIdentifier.Phone]: [SignInIdentifier.Phone],
  [SignUpIdentifier.EmailOrPhone]: [SignInIdentifier.Email, SignInIdentifier.Phone],
  [SignUpIdentifier.None]: [],
};
