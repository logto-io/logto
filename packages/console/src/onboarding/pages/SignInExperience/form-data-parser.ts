import type { SignInExperience } from '@logto/schemas';
import { SignInIdentifier } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import { Authentication, type UpdateOnboardingSieData, type OnboardingSieFormData } from './types';

const fromSignInExperience = (signInExperience: SignInExperience): OnboardingSieFormData => {
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

const toSignInExperience = (
  formData: OnboardingSieFormData,
  initialSignInExperience: SignInExperience
): SignInExperience => {
  const { logo, color: onboardConfigColor, identifier, authentications, socialTargets } = formData;
  const { color: initialColor, branding: initialBranding } = initialSignInExperience;

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
    ...initialSignInExperience,
    branding: {
      ...initialBranding,
      logoUrl: conditional(logo?.length && logo),
      darkLogoUrl: conditional(logo?.length && logo),
    },
    color: {
      ...initialColor,
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

const toUpdateOnboardingSieData = (
  formData: OnboardingSieFormData,
  initialSignInExperience: SignInExperience
): UpdateOnboardingSieData => {
  const { color, branding, signUp, signIn, socialSignInConnectorTargets } = toSignInExperience(
    formData,
    initialSignInExperience
  );

  return {
    color,
    branding,
    signUp,
    signIn,
    socialSignInConnectorTargets,
  };
};

export const formDataParser = {
  fromSignInExperience,
  toSignInExperience,
  toUpdateOnboardingSieData,
};
