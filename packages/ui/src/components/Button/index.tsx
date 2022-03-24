import classNames from 'classnames';
import React, { ReactNode } from 'react';

import * as styles from './index.module.scss';

export type Props = {
  htmlType?: 'button' | 'submit' | 'reset';
  size?: 'large' | 'small';
  isDisabled?: boolean;
  className?: string;
  children: ReactNode; // TODO: make it i18nKey with optional params
  type?: 'primary' | 'secondary';
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
    className={classNames(styles.button, styles[type], styles[size], className)}
    type={htmlType}
    onClick={onClick}
  >
    {children}
  </button>
);

export default Button;
