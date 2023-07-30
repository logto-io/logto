import { ConnectorPlatform, type ConnectorMetadata } from '@logto/connector-kit';

export const defaultMetadata: ConnectorMetadata = {
  id: 'walletconnect-universal',
  target: 'walletconnect',
  platform: ConnectorPlatform.Universal,
  name: {
    en: 'WalletConnect',
    'zh-CN': 'WalletConnect',
  },
  logo: './logo.svg',
  logoDark: './logo-dark.svg',
  description: {
    en: 'WalletConnect',
    'zh-CN': 'WalletConnect是一个...',
  },
  readme: './README.md',
};
