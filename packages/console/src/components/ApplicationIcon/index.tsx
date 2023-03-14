import type { ApplicationType } from '@logto/schemas';
import { useContext } from 'react';

import { darkModeApplicationIconMap, lightModeApplicationIconMap } from '@/consts';
import { AppThemeContext } from '@/contexts/AppThemeProvider';
import { Theme } from '@/types/theme';

type Props = {
  type: ApplicationType;
  className?: string;
};

const ApplicationIcon = ({ type, className }: Props) => {
  const { theme } = useContext(AppThemeContext);
  const isLightMode = theme === Theme.LightMode;
  const Icon = isLightMode ? lightModeApplicationIconMap[type] : darkModeApplicationIconMap[type];

  return <Icon className={className} />;
};

export default ApplicationIcon;
