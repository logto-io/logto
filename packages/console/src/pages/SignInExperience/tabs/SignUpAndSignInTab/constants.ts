import { SignUpIdentifier, SignInIdentifier, ConnectorType } from '@logto/schemas';

export const signUpIdentifiers = Object.values(SignUpIdentifier);

export const signInIdentifiers = Object.values(SignInIdentifier);

export const requiredVerifySignUpIdentifiers = [
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

export const signUpIdentifierToRequiredConnectorMapping: {
  [key in SignUpIdentifier]: ConnectorType[];
} = {
  [SignUpIdentifier.Username]: [],
  [SignUpIdentifier.Email]: [ConnectorType.Email],
  [SignUpIdentifier.Phone]: [ConnectorType.Sms],
  [SignUpIdentifier.EmailOrPhone]: [ConnectorType.Email, ConnectorType.Sms],
  [SignUpIdentifier.None]: [],
};

export const signInIdentifierToRequiredConnectorMapping: {
  [key in SignInIdentifier]: ConnectorType[];
} = {
  [SignInIdentifier.Username]: [],
  [SignInIdentifier.Email]: [ConnectorType.Email],
  [SignInIdentifier.Phone]: [ConnectorType.Sms],
};
