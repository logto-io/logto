import classNames from 'classnames';
import { ReactNode, AnchorHTMLAttributes } from 'react';
import { TFuncKey, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import * as styles from './index.module.scss';

export type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  className?: string;
  children?: ReactNode;
  text?: TFuncKey;
  type?: 'primary' | 'secondary';
  to?: string;
};

const TextLink = ({ className, children, text, type = 'primary', to, ...rest }: Props) => {
  const { t } = useTranslation();

  if (to) {
    return (
      <Link className={classNames(styles.link, styles[type], className)} to={to}>
        {children ?? (text ? String(t(text)) : '')}
      </Link>
    );
  }

  return (
    <a className={classNames(styles.link, styles[type], className)} {...rest} rel="noreferrer">
      {children ?? (text ? String(t(text)) : '')}
    </a>
  );
};

export default TextLink;
