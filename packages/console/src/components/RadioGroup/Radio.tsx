import classNames from 'classnames';
import React, { KeyboardEventHandler, ReactNode, useCallback } from 'react';

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
  title?: string;
  name?: string;
  children?: ReactNode;
  isChecked?: boolean;
  onClick?: () => void;
  tabIndex?: number;
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
}: Props) => {
  const handleKeyPress: KeyboardEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if ([' ', 'Enter'].includes(event.key)) {
        onClick?.();
        event.preventDefault();
      }
    },
    [onClick]
  );

  return (
    <div
      className={classNames(styles.radio, className, isChecked && styles.checked)}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyPress={handleKeyPress}
    >
      <input readOnly disabled type="radio" name={name} value={value} checked={isChecked} />
      {title && (
        <div className={classNames(styles.headline, !children && styles.center)}>
          <div className={styles.title}>{title}</div>
        </div>
      )}
      <Check />
      {children}
    </div>
  );
};

export default Radio;
