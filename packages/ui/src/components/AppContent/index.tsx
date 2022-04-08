import classNames from 'classnames';
import React, { ReactNode, useState, useMemo, useCallback } from 'react';

import PageContext from '@/hooks/page-context';

import LoadingLayer from '../LoadingLayer';
import Toast from '../Toast';
import * as styles from './index.module.scss';

export type Theme = 'dark' | 'light';

export type Props = {
  theme: Theme;
  children: ReactNode;
};

const AppContent = ({ children, theme }: Props) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const context = useMemo(() => ({ toast, loading, setLoading, setToast }), [loading, toast]);

  // Prevent internal eventListener rebind
  const hideToast = useCallback(() => {
    setToast('');
  }, []);

  return (
    <PageContext.Provider value={context}>
      <main className={classNames(styles.content, styles.universal, styles.mobile, styles[theme])}>
        {children}
        <Toast message={toast} isVisible={Boolean(toast)} callback={hideToast} />
        {loading && <LoadingLayer />}
      </main>
    </PageContext.Provider>
  );
};

export default AppContent;
