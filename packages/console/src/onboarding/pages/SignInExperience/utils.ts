import type { SignInExperience } from '@logto/schemas';
import { SignInIdentifier } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import type { OnboardingSieConfig } from '@/onboarding/types';
import { Authentication } from '@/onboarding/types';

const signInExperienceToOnboardSieConfig = (
  signInExperience: SignInExperience
): OnboardingSieConfig => {
  const {
    color: { primaryColor },
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
  };
};

const onboardSieConfigToSignInExperience = (
  config: OnboardingSieConfig,
  basedConfig: SignInExperience
): SignInExperience => {
  const { logo, color: onboardConfigColor, identifier, authentications, socialTargets } = config;
  const { color: baseColorConfig, branding: baseBranding } = basedConfig;

  // Map to sign-up config
  const shouldSetPasswordAtSignUp =
    identifier === SignInIdentifier.Username || authentications.includes(Authentication.Password);
  const shouldVerifyAtSignUp = identifier !== SignInIdentifier.Username;

  // Map to sign-in methods
  const isSignInByPasswordEnabled =
    identifier === SignInIdentifier.Username || authentications.includes(Authentication.Password);
  const isSignInByVerificationCodeEnabled =
    identifier !== SignInIdentifier.Username &&
    authentications.includes(Authentication.VerificationCode);

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
    },
    signUp: {
      identifiers: [identifier],
      verify: shouldVerifyAtSignUp,
      password: shouldSetPasswordAtSignUp,
    },
    signIn: {
      methods: [
        {
          identifier,
          password: isSignInByPasswordEnabled,
          verificationCode: isSignInByVerificationCodeEnabled,
          isPasswordPrimary: isSignInByPasswordEnabled,
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
