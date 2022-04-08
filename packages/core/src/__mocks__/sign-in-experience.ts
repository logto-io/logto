import {
  Branding,
  BrandingStyle,
  Language,
  LanguageInfo,
  SignInExperience,
  SignInMethods,
  SignInMethodState,
  TermsOfUse,
} from '@logto/schemas';

export const mockSignInExperience: SignInExperience = {
  id: 'foo',
  branding: {
    primaryColor: '#000',
    backgroundColor: '#fff',
    darkMode: true,
    darkBackgroundColor: '#000',
    darkPrimaryColor: '#fff',
    style: BrandingStyle.Logo,
    logoUrl: 'http://logto.png',
    slogan: 'logto',
  },
  termsOfUse: {
    enabled: false,
  },
  forgetPasswordEnabled: true,
  languageInfo: {
    autoDetect: true,
    fallbackLanguage: Language.english,
    fixedLanguage: Language.chinese,
  },
  signInMethods: {
    username: SignInMethodState.primary,
    email: SignInMethodState.disabled,
    sms: SignInMethodState.disabled,
    social: SignInMethodState.secondary,
  },
  socialSignInConnectorIds: ['github', 'facebook'],
};

export const mockBranding: Branding = {
  primaryColor: '#000',
  backgroundColor: '#fff',
  darkMode: true,
  darkBackgroundColor: '#000',
  darkPrimaryColor: '#fff',
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
  fallbackLanguage: Language.english,
  fixedLanguage: Language.chinese,
};

export const mockSignInMethods: SignInMethods = {
  username: SignInMethodState.primary,
  email: SignInMethodState.disabled,
  sms: SignInMethodState.disabled,
  social: SignInMethodState.disabled,
};
