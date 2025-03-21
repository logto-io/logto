import { type ConnectorType, SignInIdentifier } from '@logto/schemas';

import { type SignUpIdentifier } from '../../types';
import { signUpIdentifiersMapping } from '../constants';

import { identifierRequiredConnectorMapping } from './constants';

export const createSignInMethod = (identifier: SignInIdentifier) => ({
  identifier,
  password: true,
  verificationCode: identifier !== SignInIdentifier.Username,
  isPasswordPrimary: true,
});

/**
 * Check if the verification is required for the given sign-up identifier.
 *
 * - Email
 * - Phone
 * - EmailOrSms
 */
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
