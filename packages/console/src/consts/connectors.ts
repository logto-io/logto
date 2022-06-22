import { AdminConsoleKey, I18nKey } from '@logto/phrases';
import { ConnectorPlatform, ConnectorType } from '@logto/schemas';

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
