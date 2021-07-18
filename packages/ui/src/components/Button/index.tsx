import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

export type Props = {
  isDisabled?: boolean;
  className?: string;
  value?: string;
  onClick?: React.MouseEventHandler;
};

const Button = ({ isDisabled = false, className, value, onClick }: Props) => {
  return (
    <input
      className={classNames(styles.button, isDisabled && styles.disabled, className)}
      type="button"
      value={value}
      onClick={(event) => {
        if (!isDisabled) {
          onClick?.(event);
        }
      }}
    />
  );
};

export default Button;
