import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorPlatform } from '@logto/connector-kit';
import { clientSecretFormItem, clientIdFormItem, scopeFormItem } from '@logto/connector-oauth';

export const jwksUri = 'https://gitlab.com/oauth/discovery/keys';
export const authorizationEndpoint = 'https://gitlab.com/oauth/authorize';
export const userInfoEndpoint = 'https://gitlab.com/oauth/userinfo';
export const tokenEndpoint = 'https://gitlab.com/oauth/token';
export const scope = 'openid profile email';

export const defaultMetadata: ConnectorMetadata = {
  id: 'gitlab-universal',
  target: 'gitlab',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'GitLab',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'GitLab is an online community for software development and version control.',
  },
  readme: './README.md',
  formItems: [
    clientIdFormItem,
    clientSecretFormItem,
    {
      ...scopeFormItem,
      description:
        "The `scope` determines permissions granted by the user's authorization. If you are not sure what to enter, do not worry, just leave it blank.",
    },
  ],
};

export const defaultTimeout = 5000;
