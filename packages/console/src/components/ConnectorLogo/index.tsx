import type { ConnectorResponse } from '@logto/schemas';
import { AppearanceMode } from '@logto/schemas';

import { useTheme } from '@/hooks/use-theme';

type Props = {
  className?: string;
  data: Pick<ConnectorResponse, 'logo' | 'logoDark'>;
};

const ConnectorLogo = ({ className, data }: Props) => {
  const theme = useTheme();

  return (
    <img
      className={className}
      alt="logo"
      src={theme === AppearanceMode.DarkMode && data.logoDark ? data.logoDark : data.logo}
    />
  );
};

export default ConnectorLogo;
