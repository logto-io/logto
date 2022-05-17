import { AppearanceMode } from '@logto/schemas';
import { conditionalString } from '@silverhand/essentials';
import React, { ReactNode, useEffect, useCallback, useContext } from 'react';
import { useDebouncedLoader } from 'use-debounced-loader';

import LoadingLayer from '@/components/LoadingLayer';
import Toast from '@/components/Toast';
import { PageContext } from '@/hooks/use-page-context';
import useTheme from '@/hooks/use-theme';
import { Platform } from '@/types';

import * as styles from './index.module.scss';

export type Props = {
  children: ReactNode;
  mode?: AppearanceMode;
  platform?: Platform;
};

const AppContent = ({ children, mode, platform: platformOverwrite }: Props) => {
  const theme = useTheme(mode);
  const { toast, loading, platform, setPlatform, setToast } = useContext(PageContext);
  const debouncedLoading = useDebouncedLoader(loading);

  // Prevent internal eventListener rebind
  const hideToast = useCallback(() => {
    setToast('');
  }, [setToast]);

  useEffect(() => {
    if (platformOverwrite) {
      setPlatform(platformOverwrite);
    }
  }, [platformOverwrite, setPlatform]);

  useEffect(() => {
    document.body.classList.remove(conditionalString(styles.light), conditionalString(styles.dark));
    document.body.classList.add(conditionalString(styles[theme]));
  }, [theme]);

  useEffect(() => {
    document.body.classList.remove('desktop', 'mobile');
    document.body.classList.add(platform === 'mobile' ? 'mobile' : 'desktop');
  }, [platform]);

  return (
    <main>
      <div className={styles.content}>{children}</div>
      <Toast message={toast} isVisible={Boolean(toast)} callback={hideToast} />
      {debouncedLoading && <LoadingLayer />}
    </main>
  );
};

export default AppContent;
