import type { SignInExperience } from '@logto/schemas';
import { SignInIdentifier } from '@logto/schemas';

import type { OnboardingSieConfig } from '@/onboarding/types';
import { Authentication } from '@/onboarding/types';

const signInExperienceToOnboardSieConfig = (
  signInExperience: SignInExperience
): OnboardingSieConfig => {
  const {
    color: { primaryColor },
    signIn: { methods: signInMethods },
    signUp: { identifiers: signUpIdentifiers },
  } = signInExperience;

  const identifier =
    signInMethods.find(({ identifier }) => signUpIdentifiers.includes(identifier))?.identifier ??
    SignInIdentifier.Username;

  const authentications = signInMethods.reduce<Authentication[]>((result, method) => {
    const { password, verificationCode } = method;

    return [
      ...result,
      ...(password ? [Authentication.Password] : []),
      ...(verificationCode ? [Authentication.VerificationCode] : []),
    ];
  }, []);

  return {
    color: primaryColor,
    identifier,
    authentications,
  };
};

const onboardSieConfigToSignInExperience = (
  config: OnboardingSieConfig,
  basedConfig: SignInExperience
): SignInExperience => {
  const { color: onboardConfigColor, identifier, authentications } = config;
  const { color: baseColorConfig } = basedConfig;

  const isPasswordSetup = authentications.includes(Authentication.Password);
  const isVerificationCodeSetup =
    authentications.includes(Authentication.VerificationCode) &&
    identifier !== SignInIdentifier.Username;

  const signInExperience = {
    ...basedConfig,
    color: {
      ...baseColorConfig,
      primaryColor: onboardConfigColor,
    },
    signUp: {
      identifiers: [identifier],
      password: isPasswordSetup,
      verify: isVerificationCodeSetup,
    },
    signIn: {
      methods: [
        {
          identifier,
          password: isPasswordSetup,
          verificationCode: isVerificationCodeSetup,
          isPasswordPrimary: isPasswordSetup,
        },
      ],
    },
  };

  return signInExperience;
};

export const parser = {
  signInExperienceToOnboardSieConfig,
  onboardSieConfigToSignInExperience,
};
