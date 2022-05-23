import { ConnectorMetadata, ConnectorType, ConnectorPlatform } from '@logto/connector-types';
import { getFileContents } from '@logto/shared/lib/file-utils';

export const authorizationEndpoint = 'https://open.weixin.qq.com/connect/qrconnect';
export const accessTokenEndpoint = 'https://api.weixin.qq.com/sns/oauth2/access_token';
export const userInfoEndpoint = 'https://api.weixin.qq.com/sns/userinfo';
export const scope = 'snsapi_login';

const pathToReadmeFile = '../README.md';
const pathToConfigTemplate = '../docs/config-template.md';
const readmeContentFallback = 'Please check README.md file directory.';
const configTemplateFallback = 'Please check config-template.md file directory.';

export const defaultMetadata: ConnectorMetadata = {
  target: 'wechat',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Web,
  name: {
    en: 'WeChat',
    'zh-CN': '微信',
  },
  logo: 'https://gist.githubusercontent.com/darcyYe/31bc893a0a305dc43cf831bf0b14f0fc/raw/faf985d3fbeed88180b8f3cb709892320d66ae45/wechat.svg',
  description: {
    en: 'Sign In with WeChat',
    'zh-CN': '微信登录',
  },
  readme: getFileContents(pathToReadmeFile, readmeContentFallback),
  configTemplate: getFileContents(pathToConfigTemplate, configTemplateFallback),
};

export const defaultTimeout = 5000;
