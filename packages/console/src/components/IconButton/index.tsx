import classNames from 'classnames';
import { HTMLProps } from 'react';

import * as styles from './index.module.scss';

export type Props = Omit<HTMLProps<HTMLButtonElement>, 'size' | 'type'> & {
  size?: 'small' | 'medium' | 'large';
};

const IconButton = ({ size = 'medium', children, className, ...rest }: Props) => {
  return (
    <button type="button" className={classNames(styles.button, styles[size], className)} {...rest}>
      {children}
    </button>
  );
};

export default IconButton;
