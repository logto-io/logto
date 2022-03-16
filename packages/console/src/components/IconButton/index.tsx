import classNames from 'classnames';
import React, { HTMLProps } from 'react';

import * as styles from './index.module.scss';

export type Props = Omit<HTMLProps<HTMLButtonElement>, 'size' | 'type'> & {
  size?: 'small' | 'medium' | 'large';
};

const IconButton = ({ size = 'medium', children, ...rest }: Props) => {
  return (
    <button type="button" className={classNames(styles.button, styles[size])} {...rest}>
      {children}
    </button>
  );
};

export default IconButton;
