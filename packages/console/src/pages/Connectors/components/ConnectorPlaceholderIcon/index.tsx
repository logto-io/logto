import { AppearanceMode, ConnectorType } from '@logto/schemas';
import React from 'react';

import EmailConnectorDark from '@/assets/images/connector-email-dark.svg';
import EmailConnector from '@/assets/images/connector-email.svg';
import SmsConnectorIconDark from '@/assets/images/connector-sms-dark.svg';
import SmsConnectorIcon from '@/assets/images/connector-sms.svg';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  type: ConnectorType;
};

const ConnectorPlaceholderIcon = ({ type }: Props) => {
  const theme = useTheme();
  const isLightMode = theme === AppearanceMode.LightMode;

  switch (type) {
    case ConnectorType.Email:
      return isLightMode ? <EmailConnector /> : <EmailConnectorDark />;
    case ConnectorType.SMS:
      return isLightMode ? <SmsConnectorIcon /> : <SmsConnectorIconDark />;
    default:
      return null;
  }
};

export default ConnectorPlaceholderIcon;
