import type { ConnectorMetadata } from '@logto/connector-kit';
import { ConnectorPlatform } from '@logto/connector-kit';
import { clientIdFormItem, clientSecretFormItem, scopeFormItem } from '@logto/connector-oauth';

export const authorizationEndpoint = 'https://huggingface.co/oauth/authorize';
export const tokenEndpoint = 'https://huggingface.co/oauth/token';
export const userInfoEndpoint = 'https://huggingface.co/oauth/userinfo';

export const defaultMetadata: ConnectorMetadata = {
  id: 'huggingface-universal',
  target: 'huggingface',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'Hugging Face',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Hugging Face is a machine learning (ML) and data science platform and community that helps users build, deploy and train machine learning models.',
  },
  readme: './README.md',
  formItems: [
    clientIdFormItem,
    clientSecretFormItem,
    {
      ...scopeFormItem,
      description:
        "`profile` is required to get user's profile information, `email` is required to get user's email address. These scopes can be used individually or in combination; if no scopes are specified, `profile` will be used by default.",
    },
  ],
};

export const defaultTimeout = 5000;
