import classNames from 'classnames';
import type { HTMLProps, Ref } from 'react';
import { forwardRef } from 'react';

import styles from './IconButton.module.scss';

export type Props = Omit<HTMLProps<HTMLButtonElement>, 'type'>;

const IconButton = ({ children, className, ...rest }: Props, ref: Ref<HTMLButtonElement>) => {
  return (
    <button ref={ref} type="button" className={classNames(styles.iconButton, className)} {...rest}>
      {children}
    </button>
  );
};

export default forwardRef<HTMLButtonElement, Props>(IconButton);
