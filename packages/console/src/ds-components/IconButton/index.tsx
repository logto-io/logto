import classNames from 'classnames';
import type { ForwardedRef, HTMLProps } from 'react';
import { forwardRef, useRef } from 'react';

import styles from './index.module.scss';

type Props = Omit<HTMLProps<HTMLButtonElement>, 'size' | 'type'> & {
  readonly size?: 'small' | 'medium' | 'large';
  readonly iconClassName?: string;
};

function IconButton(
  { size = 'medium', children, className, iconClassName, ...rest }: Props,
  reference: ForwardedRef<HTMLButtonElement>
) {
  const tipRef = useRef<HTMLDivElement>(null);

  return (
    <button
      ref={reference}
      type="button"
      className={classNames(styles.button, styles[size], className)}
      {...rest}
    >
      <div ref={tipRef} className={classNames(styles.icon, iconClassName)}>
        {children}
      </div>
    </button>
  );
}

export default forwardRef(IconButton);
