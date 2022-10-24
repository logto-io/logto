import type { AdminConsoleKey } from '@logto/phrases';
import type { Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import type { ForwardedRef, HTMLProps } from 'react';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import Tooltip from '../Tooltip';
import * as styles from './index.module.scss';

export type Props = Omit<HTMLProps<HTMLButtonElement>, 'size' | 'type'> & {
  size?: 'small' | 'medium' | 'large';
  tooltip?: AdminConsoleKey;
};

const IconButton = (
  { size = 'medium', children, className, tooltip, ...rest }: Props,
  reference: ForwardedRef<HTMLButtonElement>
) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const innerReference = useRef<HTMLButtonElement>(null);

  useImperativeHandle<Nullable<HTMLButtonElement>, Nullable<HTMLButtonElement>>(
    reference,
    () => innerReference.current
  );

  return (
    <>
      <button
        ref={innerReference}
        type="button"
        className={classNames(styles.button, styles[size], className)}
        {...rest}
      >
        {children}
      </button>
      {tooltip && (
        <Tooltip
          anchorRef={innerReference}
          content={t(tooltip)}
          horizontalAlign="center"
          verticalAlign="top"
        />
      )}
    </>
  );
};

export default forwardRef(IconButton);
