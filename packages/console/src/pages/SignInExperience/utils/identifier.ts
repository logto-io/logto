import type { ConnectorType } from '@logto/schemas';
import { SignInIdentifier } from '@logto/schemas';
import { isSameArray } from '@silverhand/essentials';

import { identifierRequiredConnectorMapping, signUpIdentifiersMapping } from '../constants';
import type { SignUpIdentifier } from '../types';

export const isVerificationRequiredSignUpIdentifiers = (signUpIdentifier: SignUpIdentifier) => {
  const identifiers = signUpIdentifiersMapping[signUpIdentifier];

  return identifiers.includes(SignInIdentifier.Email) || identifiers.includes(SignInIdentifier.Sms);
};

export const mapIdentifiersToSignUpIdentifier = (
  identifiers: SignInIdentifier[]
): SignUpIdentifier => {
  for (const [signUpIdentifier, mappedIdentifiers] of Object.entries(signUpIdentifiersMapping)) {
    if (isSameArray(identifiers, mappedIdentifiers)) {
      // eslint-disable-next-line no-restricted-syntax
      return signUpIdentifier as SignUpIdentifier;
    }
  }
  throw new Error('Invalid identifiers in the sign up settings.');
};

export const getSignUpRequiredConnectorTypes = (
  signUpIdentifier: SignUpIdentifier
): ConnectorType[] =>
  signUpIdentifiersMapping[signUpIdentifier]
    .map((identifier) => identifierRequiredConnectorMapping[identifier])
    // eslint-disable-next-line unicorn/prefer-native-coercion-functions
    .filter((connectorType): connectorType is ConnectorType => Boolean(connectorType));
