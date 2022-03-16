import { I18nKey } from '@logto/phrases';
import classNames from 'classnames';
import React, { HTMLProps, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

type BaseProps = Omit<HTMLProps<HTMLButtonElement>, 'type' | 'size' | 'title'> & {
  htmlType?: 'button' | 'submit' | 'reset';
  type?: 'primary' | 'danger' | 'outline' | 'plain' | 'default';
  size?: 'small' | 'medium' | 'large';
};

type TitleButtonProps = BaseProps & {
  title: I18nKey;
  icon?: ReactNode;
};

type IconButtonProps = BaseProps & {
  title?: I18nKey;
  icon: ReactNode;
};

export type Props = TitleButtonProps | IconButtonProps;

const Button = ({
  htmlType = 'button',
  type = 'default',
  size = 'medium',
  title,
  icon,
  ...rest
}: Props) => {
  const { t } = useTranslation();

  return (
    <button
      className={classNames(styles.button, styles[type], styles[size])}
      type={htmlType}
      {...rest}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {title && <span>{t(title)}</span>}
    </button>
  );
};

export default Button;
