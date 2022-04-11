import { I18nKey } from '@logto/phrases';
import { conditionalString } from '@silverhand/essentials';
import classNames from 'classnames';
import React, { HTMLProps, ReactElement, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import DangerousRaw from '../DangerousRaw';
import * as styles from './index.module.scss';

type BaseProps = Omit<HTMLProps<HTMLButtonElement>, 'type' | 'size' | 'title'> & {
  htmlType?: 'button' | 'submit' | 'reset';
  type?: 'primary' | 'danger' | 'outline' | 'plain' | 'link' | 'default';
  size?: 'small' | 'medium' | 'large';
};

type TitleButtonProps = BaseProps & {
  title: I18nKey | ReactElement<typeof DangerousRaw>;
  icon?: ReactNode;
};

type IconButtonProps = BaseProps & {
  title?: I18nKey | ReactElement<typeof DangerousRaw>;
  icon: ReactNode;
};

export type Props = TitleButtonProps | IconButtonProps;

const Button = ({
  htmlType = 'button',
  type = 'default',
  size = 'medium',
  title,
  icon,
  className,
  ...rest
}: Props) => {
  const { t } = useTranslation();

  return (
    <button
      className={classNames(
        styles.button,
        styles[type],
        styles[size],
        conditionalString(icon && styles.withIcon),
        className
      )}
      type={htmlType}
      {...rest}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {title && (typeof title === 'string' ? <span>{t(title)}</span> : title)}
    </button>
  );
};

export default Button;
