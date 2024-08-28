import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState, forwardRef } from 'react';
import type { HTMLProps, ReactElement, ReactNode, ForwardedRef } from 'react';
import { Link } from 'react-router-dom';

import { Ring as Spinner } from '@/ds-components/Spinner';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { isAbsoluteUrl } from '@/utils/url';

import type DangerousRaw from '../DangerousRaw';
import DynamicT from '../DynamicT';

import * as styles from './index.module.scss';

export type ButtonType =
  | 'primary'
  | 'danger'
  | 'outline'
  | 'text'
  | 'default'
  | 'branding'
  | 'violet';

type BaseProps = Omit<HTMLProps<HTMLButtonElement>, 'type' | 'size' | 'title' | 'ref'> & {
  htmlType?: 'button' | 'submit' | 'reset';
  type?: ButtonType;
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  loadingDelay?: number;
  trailingIcon?: ReactNode;
  to?: string;
};

type TitleButtonProps = BaseProps & {
  title: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
  icon?: ReactNode;
};

type IconButtonProps = BaseProps & {
  title?: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
  icon: ReactNode;
};

export type Props = TitleButtonProps | IconButtonProps;

function Button(
  {
    htmlType = 'button',
    type = 'default',
    size = 'medium',
    title,
    icon,
    className,
    isLoading = false,
    loadingDelay = 500,
    trailingIcon,
    disabled,
    ...rest
  }: Props,
  buttonRef: ForwardedRef<HTMLButtonElement>
) {
  const [showSpinner, setShowSpinner] = useState(false);
  const timerRef = useRef<number>();

  useEffect(() => {
    // Delay showing the spinner after 'loadingDelay' milliseconds
    if (isLoading) {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      timerRef.current = window.setTimeout(() => {
        setShowSpinner(true);
      }, loadingDelay);
    }

    return () => {
      clearTimeout(timerRef.current);
      setShowSpinner(false);
    };
  }, [isLoading, loadingDelay]);

  return (
    <button
      ref={buttonRef}
      className={classNames(
        styles.button,
        styles[type],
        styles[size],
        icon && styles.withIcon,
        isLoading && styles.loading,
        className
      )}
      type={htmlType}
      disabled={isLoading || disabled}
      {...rest}
    >
      {showSpinner && <Spinner className={styles.spinner} />}
      {icon && <span className={styles.icon}>{icon}</span>}
      {title &&
        (typeof title === 'string' ? (
          <span>
            <DynamicT forKey={title} />
          </span>
        ) : (
          title
        ))}
      {trailingIcon && <span className={styles.trailingIcon}>{trailingIcon}</span>}
    </button>
  );
}

export default forwardRef(Button);

type LinkProps = Omit<HTMLProps<HTMLAnchorElement>, 'type' | 'size' | 'title' | 'ref'> & {
  /**
   * If the link will be opened in a new tab. This prop will override the `target`
   * and `rel` attributes.
   *
   * - When it's `true`, the `rel` attribute will be set to `noopener noreferrer`.
   * - When it's `noopener`, the `rel` attribute will be set to `noopener`.
   *
   * Typically, when navigating to Logto's website (official site, blog, documentation, etc.), use 'noopener'.
   */
  readonly targetBlank?: boolean | 'noopener';
  readonly type?: ButtonType;
  readonly size?: 'small' | 'medium' | 'large';
  readonly title: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
};

export function LinkButton({
  title,
  type = 'default',
  size = 'medium',
  className,
  href,
  targetBlank,
  ...rest
}: LinkProps) {
  const { getTo } = useTenantPathname();
  const props = useMemo(
    () => ({
      ...rest,
      className: classNames(styles.button, styles[type], styles[size], className),
      ...(Boolean(targetBlank) && {
        rel: typeof targetBlank === 'string' ? targetBlank : 'noopener noreferrer',
        target: '_blank',
      }),
    }),
    [className, rest, size, targetBlank, type]
  );

  const innerElement = useMemo(
    () =>
      typeof title === 'string' ? (
        <span>
          <DynamicT forKey={title} />
        </span>
      ) : (
        title
      ),
    [title]
  );

  return !href || isAbsoluteUrl(href) ? (
    <a {...props} href={href}>
      {innerElement}
    </a>
  ) : (
    <Link {...props} to={getTo(href)}>
      {innerElement}
    </Link>
  );
}
