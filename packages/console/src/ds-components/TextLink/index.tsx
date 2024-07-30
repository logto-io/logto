import classNames from 'classnames';
import { useMemo, type AnchorHTMLAttributes, type ReactNode } from 'react';
import type { LinkProps } from 'react-router-dom';
import { Link } from 'react-router-dom';

// Used in the docs
// eslint-disable-next-line unused-imports/no-unused-imports
import { LinkButton } from '@/ds-components/Button';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import styles from './index.module.scss';

export type Props = AnchorHTMLAttributes<HTMLAnchorElement> &
  Partial<LinkProps> & {
    readonly icon?: ReactNode;
    readonly isTrailingIcon?: boolean;
    /**
     * If the link will be opened in a new tab. This prop will override the `target`
     * and `rel` attributes.
     *
     * - When it's `true`, the `rel` attribute will be set to `noopener noreferrer`.
     * - When it's `noopener`, the `rel` attribute will be set to `noopener`.
     *
     * Typically, when navigating to Logto's website (official site, blog, documentation, etc.), use 'noopener'.
     *
     * Note: This prop is align with the `targetBlank` prop of {@link LinkButton}, they share the same logic.
     */
    readonly targetBlank?: boolean | 'noopener';
  };

function TextLink({
  to,
  children,
  icon,
  isTrailingIcon = false,
  className,
  targetBlank,
  ...rest
}: Props) {
  const { getTo } = useTenantPathname();

  const props = useMemo(
    () => ({
      ...rest,
      className: classNames(styles.link, isTrailingIcon && styles.trailingIcon, className),
      ...(Boolean(targetBlank) && {
        rel: typeof targetBlank === 'string' ? targetBlank : 'noopener noreferrer',
        target: '_blank',
      }),
    }),
    [className, isTrailingIcon, rest, targetBlank]
  );

  if (to) {
    return (
      <Link to={getTo(to)} {...props}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <a {...props}>
      {icon}
      {children}
    </a>
  );
}

export default TextLink;
