import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import { forwardRef } from 'react';
import type { ReactNode, Ref } from 'react';

import Alert from '@/assets/icons/alert.svg';
import Info from '@/assets/icons/info.svg';
import Error from '@/assets/icons/toast-error.svg';
import Success from '@/assets/icons/toast-success.svg';
import type { Props as TextLinkProps } from '@/ds-components/TextLink';

import Button from '../Button';
import DynamicT from '../DynamicT';
import TextLink from '../TextLink';

import * as styles from './index.module.scss';

type Props = {
  severity?: 'info' | 'alert' | 'success' | 'error';
  children?: ReactNode;
  action?: AdminConsoleKey;
  href?: string;
  hrefTargetBlank?: TextLinkProps['targetBlank'];
  onClick?: () => void;
  variant?: 'plain' | 'shadow';
  hasIcon?: boolean;
  isActionLoading?: boolean;
  className?: string;
};

function NotificationIcon({ severity }: Required<Pick<Props, 'severity'>>) {
  switch (severity) {
    case 'info': {
      return <Info />;
    }
    case 'alert': {
      return <Alert />;
    }
    case 'success': {
      return <Success />;
    }
    case 'error': {
      return <Error />;
    }
    default: {
      return null;
    }
  }
}

function InlineNotification(
  {
    children,
    action,
    href,
    hrefTargetBlank,
    onClick,
    severity = 'info',
    variant = 'plain',
    hasIcon = true,
    isActionLoading = false,
    className,
  }: Props,
  ref?: Ref<HTMLDivElement>
) {
  return (
    <div
      ref={ref}
      className={classNames(
        styles.inlineNotification,
        styles[severity],
        styles[variant],
        className
      )}
    >
      {hasIcon && (
        <div className={styles.icon}>
          <NotificationIcon severity={severity} />
        </div>
      )}
      <div className={styles.content}>{children}</div>
      {action && href && (
        <TextLink to={href} targetBlank={hrefTargetBlank}>
          <DynamicT forKey={action} />
        </TextLink>
      )}
      {action && onClick && (
        <div className={styles.action}>
          <Button
            title={action}
            type="text"
            size="small"
            isLoading={isActionLoading}
            onClick={onClick}
          />
        </div>
      )}
    </div>
  );
}

export default forwardRef(InlineNotification);
