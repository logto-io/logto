import type {
  Branding,
  LanguageInfo,
  SignInExperience,
  Color,
  SignUp,
  SignIn,
} from '@logto/schemas';
import { SignInMode, SignInIdentifier, MfaPolicy, AgreeToTermsPolicy } from '@logto/schemas';

export const mockColor: Color = {
  primaryColor: '#000',
  isDarkModeEnabled: true,
  darkPrimaryColor: '#fff',
};

export const mockBranding: Branding = {
  logoUrl: 'http://silverhand.png',
};

export const mockTermsOfUseUrl = 'http://silverhand.com/terms';
export const mockPrivacyPolicyUrl = 'http://silverhand.com/privacy';

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

export const mockSignInExperience: SignInExperience = {
  tenantId: 'fake_tenant',
  id: 'foo',
  color: {
    primaryColor: '#000',
    isDarkModeEnabled: true,
    darkPrimaryColor: '#fff',
  },
  branding: {
    logoUrl: 'http://logto.png',
  },
  termsOfUseUrl: mockTermsOfUseUrl,
  privacyPolicyUrl: mockPrivacyPolicyUrl,
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
        identifier: SignInIdentifier.Phone,
        password: true,
        verificationCode: true,
        isPasswordPrimary: true,
      },
    ],
  },
  socialSignInConnectorTargets: ['github', 'facebook', 'wechat'],
  signInMode: SignInMode.SignInAndRegister,
  customCss: null,
  customContent: {},
  agreeToTermsPolicy: AgreeToTermsPolicy.Automatic,
  customUiAssets: null,
  passwordPolicy: {},
  mfa: {
    policy: MfaPolicy.UserControlled,
    factors: [],
  },
  singleSignOnEnabled: true,
  socialSignIn: {},
};
