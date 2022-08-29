import { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import { ReactNode } from 'react';

import LinkButton from '@/components/LinkButton';
import Info from '@/icons/Info';

import Button from '../Button';
import * as styles from './index.module.scss';

type Props = {
  severity?: 'info';
  children?: ReactNode;
  action?: AdminConsoleKey;
  href?: string;
  onClick?: () => void;
  variant?: 'plain' | 'shadow';
};

const Alert = ({
  children,
  action,
  href,
  onClick,
  severity = 'info',
  variant = 'plain',
}: Props) => {
  return (
    <div className={classNames(styles.alert, styles[severity], styles[variant])}>
      <div className={styles.icon}>
        <Info />
      </div>
      <div className={styles.content}>{children}</div>
      {action && href && (
        <div className={styles.action}>
          <LinkButton title={action} to={href} />
        </div>
      )}
      {action && onClick && (
        <div className={styles.action}>
          <Button title={action} type="plain" onClick={onClick} />
        </div>
      )}
    </div>
  );
};

export default Alert;
