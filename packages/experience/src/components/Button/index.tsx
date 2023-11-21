import classNames from 'classnames';
import type { TFuncKey } from 'i18next';
import type { HTMLProps } from 'react';

import DynamicT from '../DynamicT';

import * as styles from './index.module.scss';

export type ButtonType = 'primary' | 'secondary';

type BaseProps = Omit<HTMLProps<HTMLButtonElement>, 'type' | 'size' | 'title'> & {
  htmlType?: 'button' | 'submit' | 'reset';
  type?: ButtonType;
  size?: 'small' | 'large';
  isDisabled?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler;
};

type Props = BaseProps & {
  title: TFuncKey;
  icon?: React.ReactNode;
  i18nProps?: Record<string, string>;
};

const Button = ({
  htmlType = 'button',
  type = 'primary',
  size = 'large',
  title,
  i18nProps,
  className,
  isDisabled = false,
  icon,
  onClick,
  ...rest
}: Props) => {
  return (
    <button
      disabled={isDisabled}
      className={classNames(
        styles.button,
        styles[type],
        styles[size],
        isDisabled && styles.isDisabled,
        className
      )}
      type={htmlType}
      onClick={onClick}
      {...rest}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <DynamicT forKey={title} interpolation={i18nProps} />
    </button>
  );
};

export default Button;
