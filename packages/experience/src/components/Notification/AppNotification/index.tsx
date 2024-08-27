import classNames from 'classnames';
import type { CSSProperties, ForwardedRef, ReactNode } from 'react';
import { forwardRef } from 'react';

import InfoIcon from '@/assets/icons/info-icon.svg?react';
import TextLink from '@/components/TextLink';

import styles from './index.module.scss';

/* eslint-disable react/require-default-props */
type Props = {
  readonly className?: string;
  readonly message: ReactNode;
  readonly onClose: () => void;
  readonly style?: CSSProperties;
};
/* eslint-enable react/require-default-props */

const AppNotification = forwardRef(
  ({ className, message, style, onClose }: Props, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <div ref={ref} className={classNames(styles.notification, className)} style={style}>
        <InfoIcon className={styles.icon} />
        <div className={styles.message}>{message}</div>
        <TextLink text="action.got_it" className={styles.link} onClick={onClose} />
      </div>
    );
  }
);

export default AppNotification;
