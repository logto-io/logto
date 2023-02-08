import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import type { KeyboardEventHandler, ReactNode } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

const Check = () => (
  <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8.66666 1.33334C4.99999 1.33334 1.99999 4.33334 1.99999 8.00001C1.99999 11.6667 4.99999 14.6667 8.66666 14.6667C12.3333 14.6667 15.3333 11.6667 15.3333 8.00001C15.3333 4.33334 12.3333 1.33334 8.66666 1.33334ZM11.4667 6.86668L8.26666 10.0667C7.99999 10.3333 7.59999 10.3333 7.33333 10.0667L5.86666 8.60001C5.59999 8.33334 5.59999 7.93334 5.86666 7.66668C6.13333 7.40001 6.53333 7.40001 6.79999 7.66668L7.79999 8.66668L10.5333 5.93334C10.8 5.66668 11.2 5.66668 11.4667 5.93334C11.7333 6.20001 11.7333 6.60001 11.4667 6.86668Z"
      fill="#5D34F2"
    />
  </svg>
);

export type Props = {
  className?: string;
  value: string;
  title?: AdminConsoleKey;
  name?: string;
  children?: ReactNode;
  isChecked?: boolean;
  onClick?: () => void;
  tabIndex?: number;
  type?: 'card' | 'plain' | 'compact';
  isDisabled?: boolean;
  disabledLabel?: AdminConsoleKey;
  icon?: ReactNode;
};

const Radio = ({
  className,
  value,
  title,
  name,
  children,
  isChecked,
  onClick,
  tabIndex,
  type,
  isDisabled,
  disabledLabel,
  icon,
}: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const handleKeyPress: KeyboardEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (isDisabled) {
        return;
      }

      if ([' ', 'Enter'].includes(event.key)) {
        onClick?.();
        event.preventDefault();
      }
    },
    [isDisabled, onClick]
  );

  return (
    <div
      className={classNames(
        styles.radio,
        isChecked && styles.checked,
        isDisabled && styles.disabled,
        className
      )}
      // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
      role="radio"
      tabIndex={tabIndex}
      onClick={isDisabled ? undefined : onClick}
      onKeyPress={handleKeyPress}
    >
      <div className={styles.content}>
        <input readOnly disabled type="radio" name={name} value={value} checked={isChecked} />
        {type === 'card' && (
          <div className={styles.indicator}>
            <Check />
          </div>
        )}
        {children}
        {type === 'plain' && <div className={styles.indicator} />}
        {icon && <span className={styles.icon}>{icon}</span>}
        {title && t(title)}
        {isDisabled && disabledLabel && (
          <div className={classNames(styles.indicator, styles.disabledLabel)}>
            {t(disabledLabel)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Radio;
