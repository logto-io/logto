import { I18nKey } from '@logto/phrases-ui';
import classNames from 'classnames';
import { HTMLProps } from 'react';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

export type ButtonType = 'primary' | 'secondary' | 'outline';

type BaseProps = Omit<HTMLProps<HTMLButtonElement>, 'type' | 'size' | 'title'> & {
  htmlType?: 'button' | 'submit' | 'reset';
  type?: ButtonType;
  size?: 'small' | 'large';
  isDisabled?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler;
};

type Props = BaseProps & {
  title: I18nKey;
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
  onClick,
  ...rest
}: Props) => {
  const { t } = useTranslation();

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
      {t(title, { ...i18nProps })}
    </button>
  );
};

export default Button;
