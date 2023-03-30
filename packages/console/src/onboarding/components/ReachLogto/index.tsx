import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import { cloneElement } from 'react';
import type { ReactNode, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';

import * as styles from './index.module.scss';

type Props = {
  title: AdminConsoleKey;
  description: AdminConsoleKey;
  icon: ReactElement;
  buttonTitle: AdminConsoleKey;
  buttonIcon?: ReactNode;
  link: string;
  className?: string;
};

function ReachLogto({ title, description, icon, buttonTitle, buttonIcon, link, className }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={classNames(styles.reachLogto, className)}>
      <div className={styles.reachLogtoInfo}>
        {cloneElement(icon, { className: styles.reachLogtoIcon })}
        <div>
          <div className={styles.reachLogtoTitle}>{t(title)}</div>
          <div className={styles.reachLogtoDescription}>{t(description)}</div>
        </div>
      </div>
      <Button
        type="outline"
        title={buttonTitle}
        icon={buttonIcon}
        onClick={() => {
          window.open(link, '_blank');
        }}
      />
    </div>
  );
}

export default ReachLogto;
