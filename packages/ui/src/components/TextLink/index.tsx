import { I18nKey } from '@logto/phrases';
import classNames from 'classnames';
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

export type Props = {
  className?: string;
  children?: ReactNode;
  text?: I18nKey;
  href?: string;
  type?: 'primary' | 'secondary';
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

const TextLink = ({ className, children, text, href, type = 'primary', onClick }: Props) => {
  const { t } = useTranslation();

  return (
    <a className={classNames(styles.link, styles[type], className)} href={href} onClick={onClick}>
      {children ?? (text ? t(text) : '')}
    </a>
  );
};

export default TextLink;
