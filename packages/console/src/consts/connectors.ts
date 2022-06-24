import { AdminConsoleKey, I18nKey } from '@logto/phrases';
import { ConnectorPlatform, ConnectorType } from '@logto/schemas';

import EmailConnectorDark from '@/assets/images/connector-email-dark.svg';
import EmailConnector from '@/assets/images/connector-email.svg';
import SmsConnectorIconDark from '@/assets/images/connector-sms-dark.svg';
import SmsConnectorIcon from '@/assets/images/connector-sms.svg';

type TitlePlaceHolder = {
  [key in ConnectorType]: I18nKey;
};

export const connectorTitlePlaceHolder: TitlePlaceHolder = Object.freeze({
  [ConnectorType.SMS]: 'admin_console.connectors.type.sms',
  [ConnectorType.Email]: 'admin_console.connectors.type.email',
  [ConnectorType.Social]: 'admin_console.connectors.type.social',
});

type ConnectorPlatformLabel = {
  [key in ConnectorPlatform]: AdminConsoleKey;
};

export const connectorPlatformLabel: ConnectorPlatformLabel = Object.freeze({
  [ConnectorPlatform.Native]: 'connectors.platform.native',
  [ConnectorPlatform.Universal]: 'connectors.platform.universal',
  [ConnectorPlatform.Web]: 'connectors.platform.web',
});

type ConnectorPlaceHolderIcon = {
  [key in ConnectorType]: SvgComponent;
};

export const lightModeConnectorPlaceHolderIcon: ConnectorPlaceHolderIcon = Object.freeze({
  [ConnectorType.SMS]: SmsConnectorIcon,
  [ConnectorType.Email]: EmailConnector,
  [ConnectorType.Social]: EmailConnector, // We don't need a icon for social right now.
} as const);

export const darkModeConnectorPlaceHolderIcon: ConnectorPlaceHolderIcon = Object.freeze({
  [ConnectorType.SMS]: SmsConnectorIconDark,
  [ConnectorType.Email]: EmailConnectorDark,
  [ConnectorType.Social]: EmailConnectorDark, // We don't need a icon for social right now.
} as const);
