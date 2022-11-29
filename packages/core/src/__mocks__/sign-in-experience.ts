import type {
  Branding,
  LanguageInfo,
  SignInExperience,
  TermsOfUse,
  Color,
  SignUp,
  SignIn,
} from '@logto/schemas';
import { BrandingStyle, SignInMode, SignInIdentifier } from '@logto/schemas';

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
  signUp: {
    identifiers: [SignInIdentifier.Username],
    password: true,
    verify: false,
  },
  signIn: {
    methods: [
      {
        identifier: SignInIdentifier.Username,
        password: true,
        isPasswordPrimary: true,
        verificationCode: true,
      },
      {
        identifier: SignInIdentifier.Email,
        password: true,
        verificationCode: true,
        isPasswordPrimary: true,
      },
      {
        identifier: SignInIdentifier.Sms,
        password: true,
        verificationCode: true,
        isPasswordPrimary: true,
      },
    ],
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

export const mockSignUp: SignUp = {
  identifiers: [SignInIdentifier.Username],
  password: true,
  verify: false,
};

export const mockSignInMethod: SignIn['methods'][0] = {
  identifier: SignInIdentifier.Username,
  password: true,
  verificationCode: false,
  isPasswordPrimary: true,
};

export const mockSignIn = {
  methods: [mockSignInMethod],
};
