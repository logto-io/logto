import { AppearanceMode, ConnectorType } from '@logto/schemas';
import React from 'react';

import { darkModeConnectorPlaceholderIcon, lightModeConnectorPlaceholderIcon } from '@/consts';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  type: ConnectorType;
  className?: string;
};

const ConnectorPlaceholderIcon = ({ type, className }: Props) => {
  const theme = useTheme();
  const isLightMode = theme === AppearanceMode.LightMode;
  const Icon = isLightMode
    ? lightModeConnectorPlaceholderIcon[type]
    : darkModeConnectorPlaceholderIcon[type];

  if (!Icon) {
    return null;
  }

  return <Icon className={className} />;
};

export default ConnectorPlaceholderIcon;
