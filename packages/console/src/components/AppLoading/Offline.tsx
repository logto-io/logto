import IllustrationDark from '@/assets/images/loading-illustration-dark.svg';
import Illustration from '@/assets/images/loading-illustration.svg';
import { Daisy as Spinner } from '@/components/Spinner';
import { Theme } from '@/types/theme';
import { getThemeFromLocalStorage } from '@/utils/theme';

import * as styles from './index.module.scss';

/**
 * An fullscreen loading component fetches local stored theme without sending request.
 */
export const AppLoadingOffline = () => {
  const theme = getThemeFromLocalStorage();

  return (
    <div className={styles.container}>
      {theme === Theme.LightMode ? <Illustration /> : <IllustrationDark />}
      <Spinner />
    </div>
  );
};
