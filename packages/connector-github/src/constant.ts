import { ConnectorMetadata, ConnectorType, ConnectorPlatform } from '@logto/connector-types';
import { getFileContents } from '@logto/shared/lib/file-utils';

export const authorizationEndpoint = 'https://github.com/login/oauth/authorize';
export const scope = 'read:user';
export const accessTokenEndpoint = 'https://github.com/login/oauth/access_token';
export const userInfoEndpoint = 'https://api.github.com/user';

const pathToReadmeFile = '../README.md';
const pathToConfigTemplate = '../docs/config-template.md';
const readmeContentFallback = 'Please check README.md file directory.';
const configTemplateFallback = 'Please check config-template.md file directory.';

export const defaultMetadata: ConnectorMetadata = {
  target: 'github',
  type: ConnectorType.Social,
  platform: ConnectorPlatform.Web,
  name: {
    en: 'GitHub',
    'zh-CN': 'GitHub',
  },
  logo: 'https://gist.githubusercontent.com/darcyYe/31bc893a0a305dc43cf831bf0b14f0fc/raw/faf985d3fbeed88180b8f3cb709892320d66ae45/github.svg',
  description: {
    en: 'Sign In with GitHub',
    'zh-CN': 'GitHub登录',
  },
  readme: getFileContents(pathToReadmeFile, readmeContentFallback),
  configTemplate: getFileContents(pathToConfigTemplate, configTemplateFallback),
};

export const defaultTimeout = 5000;
