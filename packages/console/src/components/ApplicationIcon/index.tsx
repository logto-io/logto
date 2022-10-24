import type { ApplicationType } from '@logto/schemas';
import { AppearanceMode } from '@logto/schemas';

import { darkModeApplicationIconMap, lightModeApplicationIconMap } from '@/consts';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  type: ApplicationType;
  className?: string;
};

const ApplicationIcon = ({ type, className }: Props) => {
  const theme = useTheme();
  const isLightMode = theme === AppearanceMode.LightMode;
  const Icon = isLightMode ? lightModeApplicationIconMap[type] : darkModeApplicationIconMap[type];

  return <Icon className={className} />;
};

export default ApplicationIcon;
