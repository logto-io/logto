import type { SignInExperience } from '@logto/schemas';
import {
  BrandingStyle,
  ConnectorPlatform,
  ConnectorType,
  SignInIdentifier,
  SignInMethodState,
  SignInMode,
  SignUpIdentifier,
} from '@logto/schemas';

import type { SignInExperienceSettings } from '@/types';

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

export const smsSignInMethod = {
  identifier: SignInIdentifier.Sms,
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
  termsOfUse: {
    enabled: true,
    contentUrl: 'http://terms.of.use/',
  },
  languageInfo: {
    autoDetect: true,
    fallbackLanguage: 'en',
  },
  signUp: {
    identifier: SignUpIdentifier.Username,
    password: true,
    verify: true,
  },
  signIn: {
    methods: [usernameSignInMethod, emailSignInMethod, smsSignInMethod],
  },
  signInMethods: {
    username: SignInMethodState.Primary,
    email: SignInMethodState.Secondary,
    sms: SignInMethodState.Secondary,
    social: SignInMethodState.Secondary,
  },
  socialSignInConnectorTargets: ['BE8QXN0VsrOH7xdWFDJZ9', 'lcXT4o2GSjbV9kg2shZC7'],
  signInMode: SignInMode.SignInAndRegister,
  forgotPassword: false,
};

export const mockSignInExperienceSettings: SignInExperienceSettings = {
  id: mockSignInExperience.id,
  color: mockSignInExperience.color,
  branding: mockSignInExperience.branding,
  termsOfUse: mockSignInExperience.termsOfUse,
  languageInfo: mockSignInExperience.languageInfo,
  signIn: mockSignInExperience.signIn,
  signUp: {
    methods: [SignInIdentifier.Username],
    password: true,
    verify: true,
  },
  socialConnectors,
  signInMode: SignInMode.SignInAndRegister,
  forgotPassword: false,
};
