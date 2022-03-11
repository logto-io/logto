import { useLogto } from '@logto/react';
import React, { useEffect } from 'react';
import { Outlet, useHref } from 'react-router-dom';

import Content from './components/Content';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import * as styles from './index.module.scss';

type Theme = 'light';

type Props = {
  theme: Theme;
};

const AppContent = ({ theme }: Props) => {
  const { isAuthenticated, signIn } = useLogto();
  const href = useHref('/callback');

  useEffect(() => {
    const classes = [styles.web, styles[theme]].filter((value): value is string => Boolean(value));
    document.body.classList.add(...classes);

    return () => {
      document.body.classList.remove(...classes);
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
        <Content>
          <Outlet />
        </Content>
      </div>
    </div>
  );
};

export default AppContent;
