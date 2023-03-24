import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Info from '@/assets/images/info.svg';

import Button from '../Button';
import TextLink from '../TextLink';

import * as styles from './index.module.scss';

type Props = {
  severity?: 'info';
  children?: ReactNode;
  action?: AdminConsoleKey;
  href?: string;
  onClick?: () => void;
  variant?: 'plain' | 'shadow';
  className?: string;
};

function Alert({
  children,
  action,
  href,
  onClick,
  severity = 'info',
  variant = 'plain',
  className,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={classNames(styles.alert, styles[severity], styles[variant], className)}>
      <div className={styles.icon}>
        <Info />
      </div>
      <div className={styles.content}>{children}</div>
      {action && href && <TextLink to={href}>{t(action)}</TextLink>}
      {action && onClick && (
        <div className={styles.action}>
          <Button title={action} type="text" size="small" onClick={onClick} />
        </div>
      )}
    </div>
  );
}

export default Alert;
