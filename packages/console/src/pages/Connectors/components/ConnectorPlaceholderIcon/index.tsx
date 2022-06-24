import { AppearanceMode, ConnectorType } from '@logto/schemas';
import React from 'react';

import { darkModeConnectorPlaceHolderIcon, lightModeConnectorPlaceHolderIcon } from '@/consts';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  type: ConnectorType;
  className?: string;
};

const ConnectorPlaceholderIcon = ({ type, className }: Props) => {
  const theme = useTheme();
  const isLightMode = theme === AppearanceMode.LightMode;
  const Icon = isLightMode
    ? lightModeConnectorPlaceHolderIcon[type]
    : darkModeConnectorPlaceHolderIcon[type];

  return <Icon className={className} />;
};

export default ConnectorPlaceholderIcon;
