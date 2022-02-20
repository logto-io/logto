import classNames from 'classnames';
import React, { ReactNode } from 'react';

import * as styles from './index.module.scss';

export type Theme = 'dark' | 'light';

export type Props = {
  theme: Theme;
  children: ReactNode;
};

const AppContent = ({ children, theme }: Props) => {
  return (
    <div className={classNames(styles.content, styles.universal, styles.mobile, styles[theme])}>
      {children}
    </div>
  );
};

export default AppContent;
