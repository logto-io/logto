import { type ConnectorType, SignInIdentifier } from '@logto/schemas';

import type { SignUpForm } from '../../types';
import { SignUpIdentifier } from '../../types';
import { signUpIdentifiersMapping } from '../constants';

import { identifierRequiredConnectorMapping } from './constants';

export const getSignInMethodPasswordCheckState = (
  signInIdentifier: SignInIdentifier,
  signUpConfig: SignUpForm,
  currentCheckState: boolean
) => {
  if (signInIdentifier === SignInIdentifier.Username) {
    return currentCheckState;
  }

  const { password: isSignUpPasswordRequired } = signUpConfig;

  return isSignUpPasswordRequired || currentCheckState;
};

export const getSignInMethodVerificationCodeCheckState = (
  signInIdentifier: SignInIdentifier,
  signUpConfig: SignUpForm,
  currentCheckState: boolean
) => {
  if (signInIdentifier === SignInIdentifier.Username) {
    return currentCheckState;
  }

  const { identifier: signUpIdentifier, password: isSignUpPasswordRequired } = signUpConfig;

  if (SignUpIdentifier.None !== signUpIdentifier && !isSignUpPasswordRequired) {
    return true;
  }

  return currentCheckState;
};

export const createSignInMethod = (identifier: SignInIdentifier) => ({
  identifier,
  password: true,
  verificationCode: identifier !== SignInIdentifier.Username,
  isPasswordPrimary: true,
});

export const isVerificationRequiredSignUpIdentifiers = (signUpIdentifier: SignUpIdentifier) => {
  const identifiers = signUpIdentifiersMapping[signUpIdentifier];

  return (
    identifiers.includes(SignInIdentifier.Email) || identifiers.includes(SignInIdentifier.Phone)
  );
};

export const getSignUpRequiredConnectorTypes = (
  signUpIdentifier: SignUpIdentifier
): ConnectorType[] =>
  signUpIdentifiersMapping[signUpIdentifier]
    .map((identifier) => identifierRequiredConnectorMapping[identifier])
    // eslint-disable-next-line unicorn/prefer-native-coercion-functions
    .filter((connectorType): connectorType is ConnectorType => Boolean(connectorType));
