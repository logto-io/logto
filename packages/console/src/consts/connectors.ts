import { I18nKey } from '@logto/phrases';
import { ConnectorType } from '@logto/schemas';

import emailConnectorIcon from '@/assets/images/connector-email.svg';
import smsConnectorIcon from '@/assets/images/connector-sms.svg';

type TitlePlaceHolder = {
  [key in ConnectorType]: I18nKey;
};

export const connectorTitlePlaceHolder: TitlePlaceHolder = Object.freeze({
  [ConnectorType.SMS]: 'admin_console.connectors.type.sms',
  [ConnectorType.Email]: 'admin_console.connectors.type.email',
  [ConnectorType.Social]: 'admin_console.connectors.type.social',
});

type IconPlaceHolder = {
  [key in ConnectorType]: string;
};

export const connectorIconPlaceHolder: IconPlaceHolder = Object.freeze({
  [ConnectorType.SMS]: smsConnectorIcon,
  [ConnectorType.Email]: emailConnectorIcon,
  // Note: we don't need icon placeholder for social connector
  [ConnectorType.Social]: '',
});
