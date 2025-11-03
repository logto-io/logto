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
    'zh-CN':
      'Hugging Face 是一个机器学习和数据科学平台与社区，帮助用户构建、部署和训练机器学习模型。',
    'tr-TR':
      'Hugging Face, kullanıcıların makine öğrenimi modelleri oluşturmasına, dağıtmasına ve eğitmesine yardımcı olan bir makine öğrenimi ve veri bilimi platformu ile topluluğudur.',
    ko: 'Hugging Face는 사용자가 머신러닝 모델을 구축하고 배포하며 학습하도록 돕는 머신러닝·데이터 과학 플랫폼이자 커뮤니티입니다.',
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
