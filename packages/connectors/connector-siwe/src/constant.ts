import type { ConnectorMetadata } from '@logto/connector-kit';
import {
  ConnectorConfigFormItemType,
  ConnectorPlatform,
  SiweConnector,
} from '@logto/connector-kit';

/**
 * Common EVM mainnet chain IDs. Administrators can override this list in the connector config.
 * The list is also used as the default when the config field is left empty.
 */
export const defaultChainIds = [
  1, // Ethereum
  137, // Polygon
  56, // BNB Smart Chain
  42_161, // Arbitrum One
  8453, // Base
  10, // OP Mainnet
  43_114, // Avalanche C-Chain
  59_144, // Linea
  324, // ZkSync Era
];

/** How long a generated SIWE message remains valid. */
export const nonceTtlSeconds = 10 * 60;

/**
 * The default statement shown in the wallet signature request.
 *
 * The SIWE parser used by the connector requires a statement line, so the connector always
 * includes one even when the administrator leaves the config empty.
 */
export const defaultStatement = 'Sign in to Logto';

export const defaultMetadata: ConnectorMetadata = {
  id: SiweConnector.factoryId,
  target: SiweConnector.target,
  platform: ConnectorPlatform.Web,
  name: {
    en: 'Ethereum Wallet',
    'zh-CN': '以太坊钱包',
    'tr-TR': 'Ethereum Cüzdanı',
    ko: '이더리움 지갑',
  },
  logo: './logo.svg',
  logoDark: null,
  description: {
    en: 'Sign in with an EVM-compatible wallet using Sign-In with Ethereum (EIP-4361).',
    'zh-CN': '使用兼容 EVM 的钱包通过 Sign-In with Ethereum（EIP-4361）登录。',
    'tr-TR': 'Sign-In with Ethereum (EIP-4361) kullanarak EVM uyumlu bir cüzdanla oturum açın.',
    ko: 'Sign-In with Ethereum(EIP-4361)을 사용해 EVM 호환 지갑으로 로그인합니다.',
  },
  readme: './README.md',
  formItems: [
    {
      key: 'statement',
      type: ConnectorConfigFormItemType.MultilineText,
      label: 'Statement',
      required: false,
      defaultValue: defaultStatement,
      placeholder: defaultStatement,
      description:
        'Optional statement shown in the wallet signature request. Line breaks are collapsed into spaces.',
    },
    {
      key: 'chainIds',
      type: ConnectorConfigFormItemType.Text,
      label: 'Allowed chain IDs',
      required: false,
      defaultValue: defaultChainIds.join(', '),
      placeholder: defaultChainIds.join(', '),
      description:
        'A comma-separated list of EVM chain IDs that users can sign in with. Leave empty to use the default list.',
    },
  ],
};
