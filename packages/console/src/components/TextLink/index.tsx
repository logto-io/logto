import classNames from 'classnames';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import type { LinkProps } from 'react-router-dom';
import { Link } from 'react-router-dom';

import * as styles from './index.module.scss';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> &
  Partial<LinkProps> & {
    icon?: ReactNode;
    isTrailingIcon?: boolean;
  };

function TextLink({ to, children, icon, isTrailingIcon = false, className, ...rest }: Props) {
  if (to) {
    return (
      <Link
        to={to}
        className={classNames(styles.link, isTrailingIcon && styles.trailingIcon, className)}
        {...rest}
      >
        {icon}
        {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
        <>{children}</>
      </Link>
    );
  }

  return (
    <a
      className={classNames(styles.link, isTrailingIcon && styles.trailingIcon, className)}
      {...rest}
    >
      {icon}
      {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
      <>{children}</>
    </a>
  );
}

export default TextLink;
