import type { SignInExperience, SignIn } from '@logto/schemas';
import {
  BrandingStyle,
  ConnectorPlatform,
  ConnectorType,
  SignInIdentifier,
  SignInMode,
} from '@logto/schemas';

import type { SignInExperienceResponse } from '@/types';

export const appLogo = 'https://avatars.githubusercontent.com/u/88327661?s=200&v=4';
export const appHeadline = 'Build user identity in a modern way';

export const socialConnectors = [
  {
    id: 'BE8QXN0VsrOH7xdWFDJZ9',
    target: 'github',
    platform: ConnectorPlatform.Web,
    type: ConnectorType.Social,
    logo: 'https://user-images.githubusercontent.com/5717882/156983224-7ea0296b-38fa-419d-9515-67e8a9612e09.png',
    logoDark: null,
    name: {
      en: 'Sign in with GitHub',
      'pt-PT': 'Entrar com GitHub',
      'zh-CN': '使用 GitHub 登录',
      'tr-TR': 'Github ile giriş yap',
      ko: 'Github 로그인',
    },
    description: {
      en: 'Sign in with GitHub',
      'pt-PT': 'Entrar com GitHub',
      'zh-CN': '使用 GitHub 登录',
      'tr-TR': 'Github ile giriş yap',
      ko: 'Github 로그인',
    },
    readme: '',
    configTemplate: '',
  },
  {
    id: '24yt_xIUl5btN4UwvFokt',
    target: 'alipay',
    platform: ConnectorPlatform.Web,
    type: ConnectorType.Social,
    logo: 'https://user-images.githubusercontent.com/5717882/156983224-7ea0296b-38fa-419d-9515-67e8a9612e09.png',
    logoDark: null,
    name: {
      en: 'Sign in with Alipay',
      'pt-PT': 'Entrar com Alipay',
      'zh-CN': '使用 Alipay 登录',
      'tr-TR': 'Alipay ile giriş yap',
      ko: 'Alipay 로그인',
    },
    description: {
      en: 'Sign in with Alipay',
      'pt-PT': 'Entrar com Alipay',
      'zh-CN': '使用 Alipay 登录',
      'tr-TR': 'Alipay ile giriş yap',
      ko: 'Alipay 로그인',
    },
    readme: '',
    configTemplate: '',
  },
  {
    id: 'E5kb2gdq769qOEYaLg1V5',
    target: 'wechat',
    platform: ConnectorPlatform.Web,
    type: ConnectorType.Social,
    logo: 'https://user-images.githubusercontent.com/5717882/156983224-7ea0296b-38fa-419d-9515-67e8a9612e09.png',
    logoDark: null,
    name: {
      en: 'Sign in with WeChat',
      'pt-PT': 'Entrar com WeChat',
      'zh-CN': '使用 WeChat 登录',
      'tr-TR': 'WeChat ile giriş yap',
      ko: 'WeChat 로그인',
    },
    description: {
      en: 'Sign in with WeChat',
      'pt-PT': 'Entrar com WeChat',
      'zh-CN': '使用 WeChat 登录',
      'tr-TR': 'WeChat ile giriş yap',
      ko: 'WeChat 로그인',
    },
    readme: '',
    configTemplate: '',
  },
  {
    id: 'xY2YZEweMFPKxphngGHhy',
    target: 'google',
    platform: ConnectorPlatform.Web,
    type: ConnectorType.Social,
    logo: 'https://user-images.githubusercontent.com/5717882/156983224-7ea0296b-38fa-419d-9515-67e8a9612e09.png',
    logoDark: null,
    name: {
      en: 'Sign in with Google',
      'pt-PT': 'Entrar com Google',
      'zh-CN': '使用 Google 登录',
      'tr-TR': 'Google ile giriş yap',
      ko: 'Google 로그인',
    },
    description: {
      en: 'Sign in with Google',
      'pt-PT': 'Entrar com Google',
      'zh-CN': '使用 Google 登录',
      'tr-TR': 'Google ile giriş yap',
      ko: 'Google 로그인',
    },
    readme: '',
    configTemplate: '',
  },
  {
    id: 'lcXT4o2GSjbV9kg2shZC7',
    target: 'facebook',
    platform: ConnectorPlatform.Web,
    type: ConnectorType.Social,
    logo: 'https://user-images.githubusercontent.com/5717882/156983224-7ea0296b-38fa-419d-9515-67e8a9612e09.png',
    logoDark: null,
    name: {
      en: 'Sign in with Meta',
      'pt-PT': 'Entrar com Facebook',
      'zh-CN': '使用 Meta 登录',
      'tr-TR': 'Meta ile giriş yap',
      ko: 'Meta 로그인',
    },
    description: {
      en: 'Sign in with Meta',
      'pt-PT': 'Entrar com Facebook',
      'zh-CN': '使用 Meta 登录',
      'tr-TR': 'Meta ile giriş yap',
      ko: 'Meta 로그인',
    },
    readme: '',
    configTemplate: '',
  },
];

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
    style: BrandingStyle.Logo_Slogan,
    logoUrl: 'http://logto.png',
    slogan: 'logto',
  },
  termsOfUseUrl: 'http://terms.of.use/',
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
};

export const mockSignInExperienceSettings: SignInExperienceResponse = {
  tenantId: 'default',
  id: mockSignInExperience.id,
  color: mockSignInExperience.color,
  branding: mockSignInExperience.branding,
  termsOfUseUrl: mockSignInExperience.termsOfUseUrl,
  languageInfo: mockSignInExperience.languageInfo,
  signIn: mockSignInExperience.signIn,
  signUp: {
    identifiers: [SignInIdentifier.Username],
    password: true,
    verify: true,
  },
  socialConnectors,
  signInMode: SignInMode.SignInAndRegister,
  forgotPassword: {
    email: true,
    phone: true,
  },
  customCss: null,
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
