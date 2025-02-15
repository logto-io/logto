import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import type { KeyboardEventHandler, ReactElement, ReactNode } from 'react';
import { useCallback } from 'react';

import type DangerousRaw from '../DangerousRaw';
import DynamicT from '../DynamicT';

import styles from './Radio.module.scss';

function Check() {
  return (
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10.8759" cy="10.5203" r="8.33333" fill="white" />
      <circle cx="10.876" cy="10.5204" r="8" fill="white" />
      <path
        d="M10.8759 2.18701C6.2926 2.18701 2.5426 5.93701 2.5426 10.5203C2.5426 15.1037 6.2926 18.8537 10.8759 18.8537C15.4593 18.8537 19.2093 15.1037 19.2093 10.5203C19.2093 5.93701 15.4593 2.18701 10.8759 2.18701ZM14.3759 9.10368L10.3759 13.1037C10.0426 13.437 9.5426 13.437 9.20927 13.1037L7.37594 11.2703C7.0426 10.937 7.0426 10.437 7.37594 10.1037C7.70927 9.77035 8.20927 9.77035 8.5426 10.1037L9.7926 11.3537L13.2093 7.93701C13.5426 7.60368 14.0426 7.60368 14.3759 7.93701C14.7093 8.27035 14.7093 8.77035 14.3759 9.10368Z"
        fill="#5D34F2"
      />
    </svg>
  );
}

export type Props = {
  readonly className?: string;
  readonly value: string;
  readonly title?: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
  readonly name?: string;
  readonly children?: ReactNode;
  readonly isChecked?: boolean;
  readonly onClick?: () => void;
  readonly tabIndex?: number;
  readonly type?: 'card' | 'plain' | 'compact' | 'small';
  readonly isDisabled?: boolean;
  readonly disabledLabel?: AdminConsoleKey;
  readonly icon?: ReactNode;
  readonly trailingIcon?: ReactNode;
  readonly hasCheckIconForCard?: boolean;
};

function Radio({
  className,
  value,
  title,
  name,
  children,
  isChecked,
  onClick,
  tabIndex,
  type = 'plain',
  isDisabled,
  disabledLabel,
  icon,
  trailingIcon,
  hasCheckIconForCard = true,
}: Props) {
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
        styles[type],
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
        {type === 'card' && hasCheckIconForCard && (
          <div className={styles.indicator}>
            <Check />
          </div>
        )}
        {children}
        {type === 'plain' && <div className={styles.indicator} />}
        {icon && <span className={styles.icon}>{icon}</span>}
        {title && (typeof title === 'string' ? <DynamicT forKey={title} /> : title)}
        {trailingIcon && <span className={styles.trailingIcon}>{trailingIcon}</span>}
        {isDisabled && disabledLabel && (
          <div className={classNames(styles.indicator, styles.disabledLabel)}>
            <DynamicT forKey={disabledLabel} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Radio;
