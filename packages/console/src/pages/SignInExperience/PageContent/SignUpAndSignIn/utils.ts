import {
  AlternativeSignUpIdentifier,
  ConnectorType,
  SignInIdentifier,
  type SignUpIdentifier as SignUpIdentifierMethod,
} from '@logto/schemas';

export const createSignInMethod = (identifier: SignInIdentifier) => ({
  identifier,
  password: true,
  verificationCode: identifier !== SignInIdentifier.Username,
  isPasswordPrimary: true,
});

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
