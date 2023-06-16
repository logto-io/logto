import type { AdminConsoleKey } from '@logto/phrases';
import { ConnectorPlatform, ConnectorType } from '@logto/schemas';

import EmailConnector from '@/assets/icons/connector-email.svg';
import SmsConnectorIcon from '@/assets/icons/connector-sms.svg';
import type { ConnectorGroup } from '@/types/connector';

type TitlePlaceHolder = {
  [key in ConnectorType]: AdminConsoleKey;
};

export const connectorTitlePlaceHolder = Object.freeze({
  [ConnectorType.Sms]: 'connectors.type.sms',
  [ConnectorType.Email]: 'connectors.type.email',
  [ConnectorType.Social]: 'connectors.type.social',
}) satisfies TitlePlaceHolder;

type ConnectorPlatformLabel = {
  [key in ConnectorPlatform]: AdminConsoleKey;
};

export const connectorPlatformLabel = Object.freeze({
  [ConnectorPlatform.Native]: 'connectors.platform.native',
  [ConnectorPlatform.Universal]: 'connectors.platform.universal',
  [ConnectorPlatform.Web]: 'connectors.platform.web',
}) satisfies ConnectorPlatformLabel;

type ConnectorPlaceholderIcon = {
  [key in ConnectorType]?: SvgComponent;
};

export const connectorPlaceholderIcon: ConnectorPlaceholderIcon = Object.freeze({
  [ConnectorType.Sms]: SmsConnectorIcon,
  [ConnectorType.Email]: EmailConnector,
});

export const defaultSmsConnectorGroup: ConnectorGroup = {
  id: 'default-sms-connector',
  type: ConnectorType.Sms,
  connectors: [],
  name: { en: '' },
  description: { en: '' },
  logo: '',
  logoDark: null,
  target: '',
};

export const defaultEmailConnectorGroup: ConnectorGroup = {
  id: 'default-email-connector',
  type: ConnectorType.Email,
  connectors: [],
  name: { en: '' },
  description: { en: '' },
  logo: '',
  logoDark: null,
  target: '',
};

// Note: these connector targets will need a native connector to support the native platform
export const supportNativePlatformTargets = ['wechat', 'alipay'];
