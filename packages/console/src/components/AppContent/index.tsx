import { useLogto } from '@logto/react';
import React, { useEffect } from 'react';
import { Outlet, useHref } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import * as styles from './index.module.scss';

type Theme = 'light' | 'dark';

type Props = {
  theme: Theme;
};

const AppContent = ({ theme }: Props) => {
  const { isAuthenticated, signIn } = useLogto();
  const href = useHref('/callback');

  useEffect(() => {
    const className = styles[theme] ?? '';
    document.body.classList.add(className);

    return () => {
      document.body.classList.remove(className);
    };
  }, [theme]);

  useEffect(() => {
    if (!isAuthenticated) {
      void signIn(new URL(href, window.location.origin).toString());
    }
  }, [href, isAuthenticated, signIn]);

  if (!isAuthenticated) {
    return <>loading</>;
  }

  return (
    <div className={styles.app}>
      <Topbar />
      <div className={styles.content}>
        <Sidebar />
        <div className={styles.main}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppContent;
