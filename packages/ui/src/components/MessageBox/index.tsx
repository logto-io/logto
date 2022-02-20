import classNames from 'classnames';
import React, { ReactNode } from 'react';

import * as styles from './index.module.scss';

export type Props = {
  className?: string;
  children: ReactNode;
};

const MessageBox = ({ className, children }: Props) => {
  return <div className={classNames(styles.messageBox, styles.error, className)}>{children}</div>;
};

export default MessageBox;
