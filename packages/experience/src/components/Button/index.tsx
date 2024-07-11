import classNames from 'classnames';
import type { TFuncKey } from 'i18next';
import type { HTMLProps } from 'react';

import Ring from '@/assets/icons/ring.svg';

import DynamicT from '../DynamicT';

import * as styles from './index.module.scss';

export type ButtonType = 'primary' | 'secondary';

type BaseProps = Omit<HTMLProps<HTMLButtonElement>, 'type' | 'size' | 'title'> & {
  readonly htmlType?: 'button' | 'submit' | 'reset';
  readonly type?: ButtonType;
  readonly size?: 'small' | 'large';
  readonly isDisabled?: boolean;
  readonly className?: string;
  readonly onClick?: React.MouseEventHandler;
  readonly isLoading?: boolean;
};

type Props = BaseProps & {
  readonly title: TFuncKey;
  readonly icon?: React.ReactNode;
  readonly i18nProps?: Record<string, string>;
};

const Button = ({
  htmlType = 'button',
  type = 'primary',
  size = 'large',
  title,
  i18nProps,
  className,
  isDisabled = false,
  isLoading = false,
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
        isDisabled && styles.disabled,
        isLoading && styles.loading,
        className
      )}
      type={htmlType}
      onClick={onClick}
      {...rest}
    >
      {icon && !isLoading && <span className={styles.icon}>{icon}</span>}
      {isLoading && (
        <span className={classNames(styles.icon, styles.loadingIcon)}>
          <Ring />
        </span>
      )}
      <DynamicT forKey={title} interpolation={i18nProps} />
    </button>
  );
};

export default Button;
