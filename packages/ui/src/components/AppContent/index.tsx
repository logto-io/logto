import classNames from 'classnames';
import React, { ReactNode, useState, useMemo } from 'react';

import PageContext from '@/hooks/page-context';

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

  const hideToast = () => {
    setToast('');
  };

  return (
    <PageContext.Provider value={context}>
      <div
        id="main"
        className={classNames(styles.content, styles.universal, styles.mobile, styles[theme])}
      >
        {children}
        <Toast message={toast} isVisible={Boolean(toast)} callback={hideToast} />
      </div>
    </PageContext.Provider>
  );
};

export default AppContent;
