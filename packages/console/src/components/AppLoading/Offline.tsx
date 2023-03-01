import { AppearanceMode } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { z } from 'zod';

import IllustrationDark from '@/assets/images/loading-illustration-dark.svg';
import Illustration from '@/assets/images/loading-illustration.svg';
import { Daisy as Spinner } from '@/components/Spinner';
import { themeStorageKey } from '@/consts';
import { getTheme } from '@/utils/theme';

import * as styles from './index.module.scss';

/**
 * An fullscreen loading component fetches local stored theme without sending request.
 */
export const AppLoadingOffline = () => {
  const theme = getTheme(
    trySafe(() => z.nativeEnum(AppearanceMode).parse(localStorage.getItem(themeStorageKey))) ??
      AppearanceMode.SyncWithSystem
  );

  return (
    <div className={styles.container}>
      {theme === 'light' ? <Illustration /> : <IllustrationDark />}
      <Spinner />
    </div>
  );
};
