import classNames from 'classnames';
import React, { ReactNode } from 'react';

import * as styles from './index.module.scss';

type Theme = 'light';

type Props = {
  children: ReactNode;
  theme: Theme;
};

const AppContent = ({ children, theme }: Props) => {
  return <div className={classNames(styles.app, styles[theme])}>{children}</div>;
};

export default AppContent;
