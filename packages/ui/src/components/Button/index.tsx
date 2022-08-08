import classNames from 'classnames';
import { ReactNode } from 'react';

import * as styles from './index.module.scss';

export type Props = {
  htmlType?: 'button' | 'submit' | 'reset';
  isDisabled?: boolean;
  className?: string;
  children: ReactNode | Record<string, unknown>;
  type?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'large';
  onClick?: React.MouseEventHandler;
};

const Button = ({
  htmlType = 'button',
  type = 'primary',
  size = 'large',
  isDisabled,
  className,
  children,
  onClick,
}: Props) => (
  <button
    disabled={isDisabled}
    className={classNames(
      styles.button,
      styles[type],
      styles[size],
      isDisabled && styles.disabled,
      className
    )}
    type={htmlType}
    onClick={onClick}
  >
    {children}
  </button>
);

export default Button;
