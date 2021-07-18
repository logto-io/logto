import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

export type Props = {
  isDisabled?: boolean;
  className?: string;
  value?: string;
  onClick?: React.MouseEventHandler;
};

const Button = ({ isDisabled, className, value, onClick }: Props) => {
  return (
    <input
      disabled={isDisabled}
      className={classNames(styles.button, className)}
      type="button"
      value={value}
      onClick={onClick}
    />
  );
};

export default Button;
