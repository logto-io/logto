import classNames from 'classnames';
import type { ReactNode, AnchorHTMLAttributes } from 'react';
import type { TFuncKey } from 'react-i18next';
import { useTranslation } from 'react-i18next';
import type { LinkProps } from 'react-router-dom';
import { Link } from 'react-router-dom';

import * as styles from './index.module.scss';

export type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  className?: string;
  children?: ReactNode;
  text?: TFuncKey;
  icon?: ReactNode;
  type?: 'primary' | 'secondary' | 'inlinePrimary';
} & Partial<LinkProps>;

const TextLink = ({ className, children, text, icon, type = 'primary', to, ...rest }: Props) => {
  const { t } = useTranslation();

  if (to) {
    return (
      <Link className={classNames(styles.link, styles[type], className)} to={to} {...rest}>
        {icon}
        {children ?? (text ? t(text) : '')}
      </Link>
    );
  }

  return (
    <a className={classNames(styles.link, styles[type], className)} {...rest} rel="noreferrer">
      {icon}
      {children ?? (text ? t(text) : '')}
    </a>
  );
};

export default TextLink;
