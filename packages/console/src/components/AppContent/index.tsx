import React, { ReactNode, useEffect } from 'react';

import * as styles from './index.module.scss';

type Theme = 'light';

type Props = {
  children: ReactNode;
  theme: Theme;
};

const AppContent = ({ children, theme }: Props) => {
  useEffect(() => {
    const classes = [styles.web, styles[theme]].filter((value): value is string => Boolean(value));
    document.body.classList.add(...classes);

    return () => {
      document.body.classList.remove(...classes);
    };
  }, [theme]);

  return <div className={styles.app}>{children}</div>;
};

export default AppContent;
