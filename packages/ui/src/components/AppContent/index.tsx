import { conditionalString } from '@silverhand/essentials';
import React, { ReactNode, useEffect, useCallback, useContext } from 'react';
import { useDebouncedLoader } from 'use-debounced-loader';

import LoadingLayer from '@/components/LoadingLayer';
import Toast from '@/components/Toast';
import { PageContext } from '@/hooks/use-page-context';
import useTheme from '@/hooks/use-theme';

import * as styles from './index.module.scss';

export type Props = {
  children: ReactNode;
};

const AppContent = ({ children }: Props) => {
  const theme = useTheme();
  const { toast, loading, platform, setToast, experienceSettings } = useContext(PageContext);
  const debouncedLoading = useDebouncedLoader(loading);

  // Prevent internal eventListener rebind
  const hideToast = useCallback(() => {
    setToast('');
  }, [setToast]);

  // Set Primary ColorTheme
  useEffect(() => {
    if (!experienceSettings) {
      return;
    }

    const {
      branding: { primaryColor, darkPrimaryColor },
    } = experienceSettings;

    document.documentElement.style.setProperty('--light-primary-color', primaryColor);
    document.documentElement.style.setProperty(
      '--dark-primary-color',
      darkPrimaryColor ?? primaryColor
    );
  }, [experienceSettings]);

  // Set Theme Mode
  useEffect(() => {
    document.body.classList.remove(conditionalString(styles.light), conditionalString(styles.dark));
    document.body.classList.add(conditionalString(styles[theme]));
  }, [theme]);

  // Apply Platform Style
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
