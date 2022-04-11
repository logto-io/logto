import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import * as buttonStyles from '@/components/TextButton/index.module.scss';

import Back from './Back';
import * as styles from './index.module.scss';

type Props = {
  to: string;
  children: ReactNode;
};

const BackLink = ({ to, children }: Props) => (
  <Link to={to} className={classNames(buttonStyles.button, styles.button)}>
    <div className={styles.body}>
      <Back />
      <div>{children}</div>
    </div>
  </Link>
);

export default BackLink;
