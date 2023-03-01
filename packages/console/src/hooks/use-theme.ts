import { getTheme } from '@/utils/theme';

import useUserPreferences from './use-user-preferences';

export const useTheme = () => {
  const {
    data: { appearanceMode },
  } = useUserPreferences();

  return getTheme(appearanceMode);
};
