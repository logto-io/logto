import { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import { KeyboardEventHandler, ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

const Check = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="18" height="18" rx="9" fill="#4F37F9" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.31476 13.858L5.13295 10.441C4.95568 10.253 4.95568 9.947 5.13295 9.757L5.77568 9.074C5.95295 8.886 6.24113 8.886 6.4184 9.074L8.63657 11.466L13.5811 6.141C13.7584 5.953 14.0465 5.953 14.2238 6.141L14.8665 6.825C15.0438 7.013 15.0438 7.32 14.8665 7.507L8.95748 13.858C8.78021 14.046 8.49203 14.046 8.31476 13.858Z"
      fill="white"
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
  type?: 'card' | 'plain';
  isDisabled?: boolean;
  disabledLabel?: AdminConsoleKey;
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
        className,
        isChecked && styles.checked,
        isDisabled && styles.disabled
      )}
      tabIndex={tabIndex}
      onClick={isDisabled ? undefined : onClick}
      onKeyPress={handleKeyPress}
    >
      <input readOnly disabled type="radio" name={name} value={value} checked={isChecked} />
      {type === 'card' && <Check />}
      {children}
      {type === 'plain' && <div className={styles.indicator} />}
      {title && t(title)}
      {isDisabled && disabledLabel && (
        <div className={styles.disabledLabel}>{t(disabledLabel)}</div>
      )}
    </div>
  );
};

export default Radio;
