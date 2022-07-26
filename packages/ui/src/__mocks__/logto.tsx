import { Language } from '@logto/phrases-ui';
import {
  BrandingStyle,
  ConnectorPlatform,
  ConnectorType,
  SignInExperience,
  SignInMethodState,
  SignInMode,
} from '@logto/schemas';

import { SignInExperienceSettings } from '@/types';

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
      'zh-CN': '使用 GitHub 登录',
      'tr-TR': 'Github ile giriş yap',
      'ko-KR': 'Github 로그인',
    },
    description: {
      en: 'Sign in with GitHub',
      'zh-CN': '使用 GitHub 登录',
      'tr-TR': 'Github ile giriş yap',
      'ko-KR': 'Github 로그인',
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
      'zh-CN': '使用 Alipay 登录',
      'tr-TR': 'Alipay ile giriş yap',
      'ko-KR': 'Alipay 로그인',
    },
    description: {
      en: 'Sign in with Alipay',
      'zh-CN': '使用 Alipay 登录',
      'tr-TR': 'Alipay ile giriş yap',
      'ko-KR': 'Alipay 로그인',
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
      'zh-CN': '使用 WeChat 登录',
      'tr-TR': 'WeChat ile giriş yap',
      'ko-KR': 'WeChat 로그인',
    },
    description: {
      en: 'Sign in with WeChat',
      'zh-CN': '使用 WeChat 登录',
      'tr-TR': 'WeChat ile giriş yap',
      'ko-KR': 'WeChat 로그인',
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
      'zh-CN': '使用 Google 登录',
      'tr-TR': 'Google ile giriş yap',
      'ko-KR': 'Google 로그인',
    },
    description: {
      en: 'Sign in with Google',
      'zh-CN': '使用 Google 登录',
      'tr-TR': 'Google ile giriş yap',
      'ko-KR': 'Google 로그인',
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
      'zh-CN': '使用 Meta 登录',
      'tr-TR': 'Meta ile giriş yap',
      'ko-KR': 'Meta 로그인',
    },
    description: {
      en: 'Sign in with Meta',
      'zh-CN': '使用 Meta 登录',
      'tr-TR': 'Meta ile giriş yap',
      'ko-KR': 'Meta 로그인',
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
    'zh-CN': '使用 Xxx 登录',
    'tr-TR': 'Xxx ile giriş yap',
    'ko-KR': 'Xxx 로그인',
  },
  description: {
    en: 'Sign in with Xxx',
    'zh-CN': '使用 Xxx 登录',
    'tr-TR': 'Xxx ile giriş yap',
    'ko-KR': 'Xxx 로그인',
  },
  readme: '',
  configTemplate: '',
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
    fallbackLanguage: Language.English,
    fixedLanguage: Language.Chinese,
  },
  signInMethods: {
    username: SignInMethodState.Primary,
    email: SignInMethodState.Secondary,
    sms: SignInMethodState.Secondary,
    social: SignInMethodState.Secondary,
  },
  socialSignInConnectorTargets: ['BE8QXN0VsrOH7xdWFDJZ9', 'lcXT4o2GSjbV9kg2shZC7'],
  signInMode: SignInMode.SignInAndRegister,
};

export const mockSignInExperienceSettings: SignInExperienceSettings = {
  color: mockSignInExperience.color,
  branding: mockSignInExperience.branding,
  termsOfUse: mockSignInExperience.termsOfUse,
  languageInfo: mockSignInExperience.languageInfo,
  primarySignInMethod: 'username',
  secondarySignInMethods: ['email', 'sms', 'social'],
  socialConnectors,
  signInMode: SignInMode.SignInAndRegister,
};
