import { Theme } from '@logto/schemas';

import IllustrationDark from '@/assets/images/loading-illustration-dark.svg';
import Illustration from '@/assets/images/loading-illustration.svg';
import { Daisy as Spinner } from '@/components/Spinner';
import { getThemeFromLocalStorage } from '@/contexts/AppThemeProvider';

import * as styles from './index.module.scss';

const AppLoading = () => {
  const theme = getThemeFromLocalStorage();

  return (
    <div className={styles.container}>
      {theme === Theme.Light ? <Illustration /> : <IllustrationDark />}
      <Spinner />
    </div>
  );
};

export default AppLoading;
