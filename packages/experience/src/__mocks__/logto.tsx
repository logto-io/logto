import type { SignInExperience, SignIn, SsoConnectorMetadata } from '@logto/schemas';
import {
  AgreeToTermsPolicy,
  ConnectorPlatform,
  ConnectorType,
  MfaPolicy,
  SignInIdentifier,
  SignInMode,
} from '@logto/schemas';

import type { SignInExperienceResponse } from '@/types';

import { socialConnectors } from './social-connectors';

export * from './social-connectors';

export const appLogo = 'https://avatars.githubusercontent.com/u/88327661?s=200&v=4';
export const appHeadline = 'Build user identity in a modern way';

export const mockSocialConnectorData = {
  id: 'arbitrary-social-connector-data',
  target: 'google',
  platform: ConnectorPlatform.Web,
  type: ConnectorType.Social,
  logo: 'http://logto.dev/logto.png',
  logoDark: null,
  name: {
    en: 'Sign in with Xxx',
    'pt-PT': 'Entrar com Xxx',
    'zh-CN': '使用 Xxx 登录',
    'tr-TR': 'Xxx ile giriş yap',
    ko: 'Xxx 로그인',
  },
  description: {
    en: 'Sign in with Xxx',
    'pt-PT': 'Entrar com Xxx',
    'zh-CN': '使用 Xxx 登录',
    'tr-TR': 'Xxx ile giriş yap',
    ko: 'Xxx 로그인',
  },
  readme: '',
  configTemplate: '',
};

export const mockSsoConnectors: SsoConnectorMetadata[] = [
  {
    id: 'arbitrary-sso-connector',
    connectorName: 'AzureAD',
    logo: 'http://logto.dev/logto.png',
  },
  {
    id: 'Google-sso-connector',
    connectorName: 'Google',
    logo: 'http://logto.dev/logto.png',
  },
];

export const emailSignInMethod = {
  identifier: SignInIdentifier.Email,
  password: true,
  verificationCode: true,
  isPasswordPrimary: true,
};

export const phoneSignInMethod = {
  identifier: SignInIdentifier.Phone,
  password: true,
  verificationCode: true,
  isPasswordPrimary: true,
};

export const usernameSignInMethod = {
  identifier: SignInIdentifier.Username,
  password: true,
  verificationCode: false,
  isPasswordPrimary: true,
};

export const mockSignInExperience: SignInExperience = {
  tenantId: 'default',
  id: 'foo',
  color: {
    primaryColor: '#000',
    isDarkModeEnabled: true,
    darkPrimaryColor: '#fff',
  },
  branding: {
    logoUrl: 'http://logto.png',
  },
  termsOfUseUrl: 'http://terms.of.use/',
  privacyPolicyUrl: 'http://privacy.policy/',
  languageInfo: {
    autoDetect: true,
    fallbackLanguage: 'en',
  },
  signUp: {
    identifiers: [SignInIdentifier.Username],
    password: true,
    verify: true,
  },
  signIn: {
    methods: [usernameSignInMethod, emailSignInMethod, phoneSignInMethod],
  },
  socialSignInConnectorTargets: ['BE8QXN0VsrOH7xdWFDJZ9', 'lcXT4o2GSjbV9kg2shZC7'],
  signInMode: SignInMode.SignInAndRegister,
  customCss: null,
  customContent: {},
  agreeToTermsPolicy: AgreeToTermsPolicy.ManualRegistrationOnly,
  customUiAssetId: null,
  passwordPolicy: {},
  mfa: {
    policy: MfaPolicy.UserControlled,
    factors: [],
  },
  singleSignOnEnabled: true,
  socialSignIn: {},
};

export const mockSignInExperienceSettings: SignInExperienceResponse = {
  tenantId: 'default',
  id: mockSignInExperience.id,
  color: mockSignInExperience.color,
  branding: mockSignInExperience.branding,
  termsOfUseUrl: mockSignInExperience.termsOfUseUrl,
  privacyPolicyUrl: mockSignInExperience.privacyPolicyUrl,
  languageInfo: mockSignInExperience.languageInfo,
  signIn: mockSignInExperience.signIn,
  signUp: {
    identifiers: [SignInIdentifier.Username],
    password: true,
    verify: true,
  },
  socialConnectors,
  ssoConnectors: [],
  signInMode: SignInMode.SignInAndRegister,
  forgotPassword: {
    email: true,
    phone: true,
  },
  customCss: null,
  customContent: {},
  agreeToTermsPolicy: mockSignInExperience.agreeToTermsPolicy,
  customUiAssetId: null,
  passwordPolicy: {},
  mfa: {
    policy: MfaPolicy.UserControlled,
    factors: [],
  },
  isDevelopmentTenant: false,
  singleSignOnEnabled: true,
  socialSignIn: {},
};

const usernameSettings = {
  identifier: SignInIdentifier.Username,
  password: true,
  verificationCode: false,
  isPasswordPrimary: true,
};

export const mockSignInMethodSettingsTestCases: Array<SignIn['methods']> = [
  [
    usernameSettings,
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
  [
    usernameSettings,
    {
      identifier: SignInIdentifier.Email,
      password: true,
      verificationCode: true,
      isPasswordPrimary: false,
    },
    {
      identifier: SignInIdentifier.Phone,
      password: true,
      verificationCode: false,
      isPasswordPrimary: false,
    },
  ],
  [
    usernameSettings,
    {
      identifier: SignInIdentifier.Email,
      password: false,
      verificationCode: true,
      isPasswordPrimary: false,
    },
    {
      identifier: SignInIdentifier.Phone,
      password: false,
      verificationCode: true,
      isPasswordPrimary: false,
    },
  ],
];

export const getBoundingClientRectMock = (mock: Partial<DOMRect>) =>
  jest.fn(() => ({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    ...mock,
    toJSON: jest.fn(),
  }));
