import classNames from 'classnames';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import type { LinkProps } from 'react-router-dom';
import { Link } from 'react-router-dom';

import useTenantPathname from '@/hooks/use-tenant-pathname';

import * as styles from './index.module.scss';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> &
  Partial<LinkProps> & {
    icon?: ReactNode;
    isTrailingIcon?: boolean;
  };

function TextLink({ to, children, icon, isTrailingIcon = false, className, ...rest }: Props) {
  const { getTo } = useTenantPathname();

  const styleClassNames = classNames(styles.link, isTrailingIcon && styles.trailingIcon, className);

  if (to) {
    return (
      <Link to={getTo(to)} className={styleClassNames} {...rest}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <a className={styleClassNames} {...rest}>
      {icon}
      {children}
    </a>
  );
}

export default TextLink;
