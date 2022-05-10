import React, { ReactNode, useEffect, useCallback, useContext } from 'react';
import { isMobile } from 'react-device-detect';
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
  const { toast, loading, setToast } = useContext(PageContext);
  const debouncedLoading = useDebouncedLoader(loading);

  // Prevent internal eventListener rebind
  const hideToast = useCallback(() => {
    setToast('');
  }, [setToast]);

  useEffect(() => {
    document.body.classList.remove(styles.light ?? '');
    document.body.classList.remove(styles.dark ?? '');
    document.body.classList.add(styles[theme] ?? '');
  }, [theme]);

  useEffect(() => {
    if (isMobile) {
      document.body.classList.add(styles.mobile ?? '');

      return;
    }
    document.body.classList.add(styles.desktop ?? '');
  }, []);

  return (
    <main>
      <div className={styles.content}>{children}</div>
      <Toast message={toast} isVisible={Boolean(toast)} callback={hideToast} />
      {debouncedLoading && <LoadingLayer />}
    </main>
  );
};

export default AppContent;
