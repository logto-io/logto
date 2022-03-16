import classNames from 'classnames';
import React from 'react';

import * as styles from './index.module.scss';

export type Props = {
  htmlType?: 'button' | 'submit' | 'reset';
  isDisabled?: boolean;
  className?: string;
  children: string; // TODO: make it i18nKey with optional params
  type?: 'primary' | 'secondary';
  onClick?: React.MouseEventHandler;
};

const Button = ({
  htmlType = 'button',
  type = 'primary',
  isDisabled,
  className,
  children,
  onClick,
}: Props) => (
  <button
    disabled={isDisabled}
    className={classNames(styles.button, styles[type], className)}
    type={htmlType}
    onClick={onClick}
  >
    {children}
  </button>
);

export default Button;
