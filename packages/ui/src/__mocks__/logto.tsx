export const appLogo = 'https://avatars.githubusercontent.com/u/88327661?s=200&v=4';
export const appHeadline = 'Build user identity in a modern way';
export const socialConnectors = [
  {
    id: 'github',
    logo: 'https://user-images.githubusercontent.com/5717882/156983224-7ea0296b-38fa-419d-9515-67e8a9612e09.png',
    name: {
      en: 'Sign in with GitHub',
    },
  },
  {
    id: 'alipay',
    logo: 'https://user-images.githubusercontent.com/5717882/156983224-7ea0296b-38fa-419d-9515-67e8a9612e09.png',
    name: {
      en: 'Sign in with Alipay',
    },
  },
  {
    id: 'wechat',
    logo: 'https://user-images.githubusercontent.com/5717882/156983224-7ea0296b-38fa-419d-9515-67e8a9612e09.png',
    name: {
      en: 'Sign in with WeChat',
    },
  },
  {
    id: 'google',
    logo: 'https://user-images.githubusercontent.com/5717882/156983224-7ea0296b-38fa-419d-9515-67e8a9612e09.png',
    name: {
      en: 'Sign in with Google',
    },
  },
  {
    id: 'facebook',
    logo: 'https://user-images.githubusercontent.com/5717882/156983224-7ea0296b-38fa-419d-9515-67e8a9612e09.png',
    name: {
      en: 'Sign in with Meta',
    },
  },
];

export const mockSignInExperience = {
  id: 'foo',
  branding: {
    primaryColor: '#000',
    isDarkModeEnabled: true,
    darkPrimaryColor: '#fff',
    style: 'Logo_Slogan',
    logoUrl: 'http://logto.png',
    slogan: 'logto',
  },
  termsOfUse: {
    enabled: false,
  },
  languageInfo: {
    autoDetect: true,
    fallbackLanguage: 'en',
    fixedLanguage: 'zh-cn',
  },
  signInMethods: {
    username: 'primary',
    email: 'secondary',
    sms: 'secondary',
    social: 'secondary',
  },
  socialSignInConnectorIds: ['github', 'facebook'],
};
