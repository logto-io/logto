import { ConnectorPlatform, type ConnectorMetadata } from '@logto/connector-kit';

export const defaultMetadata: ConnectorMetadata = {
  id: 'metamask-universal',
  target: 'metamask',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'MetaMask',
    'zh-CN': 'MetaMask',
  },
  logo: './logo.svg',
  logoDark: './logo-dark.svg',
  description: {
    en: 'MetaMask',
    'zh-CN': 'MetaMask是一个...',
  },
  readme: './README.md',
};
