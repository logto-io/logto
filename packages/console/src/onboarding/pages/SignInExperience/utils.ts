import type { SignInExperience } from '@logto/schemas';
import { SignInIdentifier } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import type { OnboardingSieConfig } from '@/onboarding/types';
import { Authentication } from '@/onboarding/types';

const signInExperienceToOnboardSieConfig = (
  signInExperience: SignInExperience
): OnboardingSieConfig => {
  const {
    color: { primaryColor, isDarkModeEnabled },
    branding: { logoUrl: logo },
    signIn: { methods: signInMethods },
    signUp: { identifiers: signUpIdentifiers },
    socialSignInConnectorTargets,
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
    logo,
    color: primaryColor,
    identifier,
    authentications,
    socialTargets: socialSignInConnectorTargets,
    isDarkModeEnabled,
  };
};

const onboardSieConfigToSignInExperience = (
  config: OnboardingSieConfig,
  basedConfig: SignInExperience
): SignInExperience => {
  const { logo, color: onboardConfigColor, identifier, authentications, socialTargets } = config;
  const { color: baseColorConfig, branding: baseBranding } = basedConfig;

  const isPasswordSetup = authentications.includes(Authentication.Password);
  const isVerificationCodeSetup = identifier !== SignInIdentifier.Username;

  const signInExperience: SignInExperience = {
    ...basedConfig,
    branding: {
      ...baseBranding,
      logoUrl: conditional(logo?.length && logo),
      darkLogoUrl: conditional(logo?.length && logo),
    },
    color: {
      ...baseColorConfig,
      primaryColor: onboardConfigColor,
      isDarkModeEnabled: false, // Note: disable dark mode for the onboarding live preview
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
    socialSignInConnectorTargets: socialTargets ?? [],
  };

  return signInExperience;
};

export const parser = {
  signInExperienceToOnboardSieConfig,
  onboardSieConfigToSignInExperience,
};
