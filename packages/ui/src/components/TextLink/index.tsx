import classNames from 'classnames';
import React, { ReactNode, AnchorHTMLAttributes } from 'react';
import { TFuncKey, useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

export type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  className?: string;
  children?: ReactNode;
  text?: TFuncKey<'translation', 'main_flow'>;
  type?: 'primary' | 'secondary';
};

const TextLink = ({ className, children, text, type = 'primary', ...rest }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });

  return (
    <a className={classNames(styles.link, styles[type], className)} {...rest} rel="noreferrer">
      {children ?? (text ? t(text) : '')}
    </a>
  );
};

export default TextLink;
