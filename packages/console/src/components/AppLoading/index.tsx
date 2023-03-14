import { useContext } from 'react';

import IllustrationDark from '@/assets/images/loading-illustration-dark.svg';
import Illustration from '@/assets/images/loading-illustration.svg';
import { Daisy as Spinner } from '@/components/Spinner';
import { AppThemeContext } from '@/contexts/AppThemeProvider';
import { Theme } from '@/types/theme';

import * as styles from './index.module.scss';

const AppLoading = () => {
  const { theme } = useContext(AppThemeContext);

  return (
    <div className={styles.container}>
      {theme === Theme.LightMode ? <Illustration /> : <IllustrationDark />}
      <Spinner />
    </div>
  );
};

export default AppLoading;
