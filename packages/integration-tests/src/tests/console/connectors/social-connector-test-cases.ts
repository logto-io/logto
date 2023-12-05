export type SocialConnectorCase = {
  groupFactoryId?: string;
  factoryId: string;
  name: string;
  initialFormData: Record<string, string>;
  updateFormData: Record<string, string>;
  errorFormData: Record<string, string>;
  standardBasicFormData?: Record<string, string>;
};

const google: SocialConnectorCase = {
  factoryId: 'google-universal',
  name: 'Google',
  initialFormData: {
    'formConfig.clientId': 'client-id',
    'formConfig.clientSecret': 'client-secret',
    'formConfig.scope': 'scope',
  },
  updateFormData: {
    'formConfig.clientId': 'new-client-id',
    'formConfig.clientSecret': 'new-client-secret',
    'formConfig.scope': 'new-scope',
  },
  errorFormData: {
    'formConfig.clientId': '',
    'formConfig.clientSecret': '',
    'formConfig.scope': '',
  },
};

const feishu: SocialConnectorCase = {
  factoryId: 'feishu-web',
  name: 'Feishu',
  initialFormData: {
    'formConfig.appId': 'app-id',
    'formConfig.appSecret': 'app-secret',
  },
  updateFormData: {
    'formConfig.appId': 'new-app-id',
    'formConfig.appSecret': 'new-app-secret',
  },
  errorFormData: {
    'formConfig.appId': '',
    'formConfig.appSecret': '',
  },
};

const wechatNative: SocialConnectorCase = {
  groupFactoryId: 'wechat-native',
  factoryId: 'wechat-native',
  name: 'WeChat',
  initialFormData: {
    'formConfig.appId': 'app-id',
    'formConfig.appSecret': 'app-secret',
    'formConfig.universalLinks': 'universal-links',
  },
  updateFormData: {
    'formConfig.appId': 'new-app-id',
    'formConfig.appSecret': 'new-app-secret',
    'formConfig.universalLinks': 'new-universal-links',
  },
  errorFormData: {
    'formConfig.appId': '',
    'formConfig.appSecret': '',
    'formConfig.universalLinks': '',
  },
};

const wechatWeb: SocialConnectorCase = {
  groupFactoryId: 'wechat-native',
  factoryId: 'wechat-web',
  name: 'WeChat',
  initialFormData: {
    'formConfig.appId': 'app-id',
    'formConfig.appSecret': 'app-secret',
    'formConfig.scope': 'scope',
  },
  updateFormData: {
    'formConfig.appId': 'new-app-id',
    'formConfig.appSecret': 'new-app-secret',
    'formConfig.scope': 'new-scope',
  },
  errorFormData: {
    'formConfig.appId': '',
    'formConfig.appSecret': '',
    'formConfig.scope': '',
  },
};

const oidc: SocialConnectorCase = {
  factoryId: 'oidc',
  name: 'OIDC',
  initialFormData: {
    'formConfig.authorizationEndpoint': 'authorization-endpoint',
    'formConfig.tokenEndpoint': 'token-endpoint',
    'formConfig.clientId': 'client-id',
    'formConfig.clientSecret': 'client-secret',
    'formConfig.scope': 'scope1 scope2',
  },
  updateFormData: {
    'formConfig.authorizationEndpoint': 'new-authorization-endpoint',
    'formConfig.tokenEndpoint': 'new-token-endpoint',
    'formConfig.clientId': 'new-client-id',
    'formConfig.clientSecret': 'new-client-secret',
    'formConfig.scope': 'scope1 scope2 scope3',
  },
  errorFormData: {
    'formConfig.authorizationEndpoint': '',
    'formConfig.tokenEndpoint': '',
    'formConfig.clientId': '',
    'formConfig.clientSecret': '',
    'formConfig.scope': '',
  },
  standardBasicFormData: {
    name: 'OIDC',
    target: 'oidc-test',
  },
};

export const socialConnectorTestCases = [
  // Universal
  google,
  // Web
  feishu,
  // Group - Native
  wechatNative,
  // Group - Web
  wechatWeb,
  // Standard
  oidc,
];
