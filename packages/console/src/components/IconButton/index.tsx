import classNames from 'classnames';
import type { ForwardedRef, HTMLProps, ReactNode } from 'react';
import { forwardRef, useRef } from 'react';

import Tooltip from '../Tooltip';
import * as styles from './index.module.scss';

export type Props = Omit<HTMLProps<HTMLButtonElement>, 'size' | 'type'> & {
  size?: 'small' | 'medium' | 'large';
  tooltip?: ReactNode;
  iconClassName?: string;
};

const IconButton = (
  { size = 'medium', children, className, tooltip, iconClassName, ...rest }: Props,
  reference: ForwardedRef<HTMLButtonElement>
) => {
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
      {tooltip && (
        <Tooltip anchorRef={tipRef} content={tooltip} position="top" horizontalAlign="center" />
      )}
    </button>
  );
};

export default forwardRef(IconButton);
