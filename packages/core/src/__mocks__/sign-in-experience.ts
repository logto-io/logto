import {
  Branding,
  BrandingStyle,
  LanguageInfo,
  SignInExperience,
  SignInMethods,
  SignInMethodState,
  TermsOfUse,
  SignInMode,
  Color,
} from '@logto/schemas';

export const mockSignInExperience: SignInExperience = {
  id: 'foo',
  color: {
    primaryColor: '#000',
    isDarkModeEnabled: true,
    darkPrimaryColor: '#fff',
  },
  branding: {
    style: BrandingStyle.Logo,
    logoUrl: 'http://logto.png',
    slogan: 'logto',
  },
  termsOfUse: {
    enabled: false,
  },
  languageInfo: {
    autoDetect: true,
    fallbackLanguage: 'en',
  },
  signInMethods: {
    username: SignInMethodState.Primary,
    email: SignInMethodState.Disabled,
    sms: SignInMethodState.Disabled,
    social: SignInMethodState.Secondary,
  },
  socialSignInConnectorTargets: ['github', 'facebook', 'wechat'],
  signInMode: SignInMode.SignInAndRegister,
};

export const mockColor: Color = {
  primaryColor: '#000',
  isDarkModeEnabled: true,
  darkPrimaryColor: '#fff',
};

export const mockBranding: Branding = {
  style: BrandingStyle.Logo_Slogan,
  logoUrl: 'http://silverhand.png',
  slogan: 'Silverhand.',
};

export const mockTermsOfUse: TermsOfUse = {
  enabled: true,
  contentUrl: 'http://silverhand.com/terms',
};

export const mockLanguageInfo: LanguageInfo = {
  autoDetect: true,
  fallbackLanguage: 'en',
};

export const mockSignInMethods: SignInMethods = {
  username: SignInMethodState.Primary,
  email: SignInMethodState.Disabled,
  sms: SignInMethodState.Disabled,
  social: SignInMethodState.Disabled,
};
