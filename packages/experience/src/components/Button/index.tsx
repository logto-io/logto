import classNames from 'classnames';
import type { TFuncKey } from 'i18next';
import { type HTMLProps } from 'react';
import { useDebouncedLoader } from 'use-debounced-loader';

import DynamicT from '../DynamicT';

import RotatingRingIcon from './RotatingRingIcon';
import styles from './index.module.scss';

export type ButtonType = 'primary' | 'secondary';

type BaseProps = Omit<HTMLProps<HTMLButtonElement>, 'type' | 'size' | 'title'> & {
  readonly htmlType?: 'button' | 'submit' | 'reset';
  readonly type?: ButtonType;
  readonly size?: 'small' | 'large';
  readonly isDisabled?: boolean;
  readonly isLoading?: boolean;
  readonly className?: string;
  readonly onClick?: React.MouseEventHandler;
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
  const isLoadingActive = useDebouncedLoader(isLoading, 300);

  return (
    <button
      disabled={isDisabled}
      className={classNames(
        styles.button,
        styles[type],
        styles[size],
        isDisabled && styles.disabled,
        isLoadingActive && styles.loading,
        className
      )}
      type={htmlType}
      onClick={onClick}
      {...rest}
    >
      <span
        className={classNames(
          styles.content,
          (isLoadingActive || Boolean(icon)) && styles.iconVisible
        )}
      >
        <span className={styles.icon}>{isLoadingActive ? <RotatingRingIcon /> : icon}</span>
        <DynamicT forKey={title} interpolation={i18nProps} />
      </span>
    </button>
  );
};

export default Button;
