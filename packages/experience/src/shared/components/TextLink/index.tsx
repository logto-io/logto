import classNames from 'classnames';
import type { TFuncKey } from 'i18next';
import type { ReactNode, AnchorHTMLAttributes } from 'react';

import DynamicT from '@/shared/components/DynamicT';

import styles from './index.module.scss';

export type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  readonly className?: string;
  readonly children?: ReactNode;
  readonly text?: TFuncKey;
  readonly icon?: ReactNode;
  readonly type?: 'primary' | 'secondary';
};

const TextLink = ({ className, children, text, icon, type = 'primary', ...rest }: Props) => {
  return (
    <a className={classNames(styles.link, styles[type], className)} {...rest} rel="noopener">
      {icon}
      {children ?? <DynamicT forKey={text} />}
    </a>
  );
};

export default TextLink;
