import classNames from 'classnames';
import React, { ReactNode } from 'react';

import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
  className?: string;
};

const Card = ({ children, className }: Props) => {
  return <div className={classNames(styles.card, className)}>{children}</div>;
};

export default Card;
