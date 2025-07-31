import {
  AlternativeSignUpIdentifier,
  ConnectorType,
  ForgotPasswordMethod,
  SignInIdentifier,
  MfaFactor,
  type SignUpIdentifier as SignUpIdentifierMethod,
} from '@logto/schemas';

export const createSignInMethod = (identifier: SignInIdentifier, mfaFactors: MfaFactor[] = []) => {
  // Check if the identifier is already used in MFA factors
  const isVerificationCodeDisabled =
    identifier === SignInIdentifier.Username ||
    (identifier === SignInIdentifier.Email &&
      mfaFactors.includes(MfaFactor.EmailVerificationCode)) ||
    (identifier === SignInIdentifier.Phone && mfaFactors.includes(MfaFactor.PhoneVerificationCode));

  return {
    identifier,
    password: true,
    verificationCode: !isVerificationCodeDisabled,
    isPasswordPrimary: true,
  };
};

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

export const getForgotPasswordMethodsRequiredConnectors = (
  forgotPasswordMethods: ForgotPasswordMethod[]
): ConnectorType[] => {
  const requiredConnectors = new Set<ConnectorType>();

  for (const method of forgotPasswordMethods) {
    switch (method) {
      case ForgotPasswordMethod.EmailVerificationCode: {
        requiredConnectors.add(ConnectorType.Email);
        continue;
      }
      case ForgotPasswordMethod.PhoneVerificationCode: {
        requiredConnectors.add(ConnectorType.Sms);
        continue;
      }
    }
  }

  return Array.from(requiredConnectors);
};
