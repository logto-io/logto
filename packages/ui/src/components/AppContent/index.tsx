import classNames from 'classnames';
import React, { ReactNode, useCallback, useContext } from 'react';

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

  // Prevent internal eventListener rebind
  const hideToast = useCallback(() => {
    setToast('');
  }, [setToast]);

  return (
    <main className={classNames(styles.content, styles.universal, styles.mobile, styles[theme])}>
      {children}
      <Toast message={toast} isVisible={Boolean(toast)} callback={hideToast} />
      {loading && <LoadingLayer />}
    </main>
  );
};

export default AppContent;
