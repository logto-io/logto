import { useContext } from 'react';

import { AppThemeContext } from '@/contexts/AppThemeProvider';

const useTheme = () => {
  const { theme } = useContext(AppThemeContext);

  return theme;
};

export default useTheme;
