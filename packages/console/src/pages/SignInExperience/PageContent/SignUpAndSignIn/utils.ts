import {
  AlternativeSignUpIdentifier,
  ConnectorType,
  SignInIdentifier,
  type SignUpIdentifier as SignUpIdentifierMethod,
} from '@logto/schemas';

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

/**
 * @deprecated
 * TODO: replace with the new implementation, once the multi sign-up identifier feature is fully implemented.
 */
export const getSignUpRequiredConnectorTypes = (
  signUpIdentifier: SignUpIdentifier
): ConnectorType[] =>
  signUpIdentifiersMapping[signUpIdentifier]
    .map((identifier) => identifierRequiredConnectorMapping[identifier])
    // eslint-disable-next-line unicorn/prefer-native-coercion-functions
    .filter((connectorType): connectorType is ConnectorType => Boolean(connectorType));

export const getSignUpIdentifiersRequiredConnectors = (
  signUpIdentifiers: SignUpIdentifierMethod[]
): ConnectorType[] => {
  const requiredConnectors = new Set<ConnectorType>();

  for (const signUpIdentifier of signUpIdentifiers) {
    switch (signUpIdentifier) {
      case SignInIdentifier.Email: {
        requiredConnectors.add(ConnectorType.Email);
        continue;
      }
      case SignInIdentifier.Phone: {
        requiredConnectors.add(ConnectorType.Sms);
        continue;
      }
      case AlternativeSignUpIdentifier.EmailOrPhone: {
        requiredConnectors.add(ConnectorType.Email);
        requiredConnectors.add(ConnectorType.Sms);
        continue;
      }
      default: {
        continue;
      }
    }
  }

  return Array.from(requiredConnectors);
};
