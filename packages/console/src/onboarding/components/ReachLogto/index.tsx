import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import { cloneElement } from 'react';
import type { ReactNode, ReactElement } from 'react';

import Button from '@/components/Button';
import DynamicT from '@/components/DynamicT';

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
  return (
    <div className={classNames(styles.reachLogto, className)}>
      <div className={styles.reachLogtoInfo}>
        {cloneElement(icon, { className: styles.reachLogtoIcon })}
        <div>
          <div className={styles.reachLogtoTitle}>
            <DynamicT forKey={title} />
          </div>
          <div className={styles.reachLogtoDescription}>
            <DynamicT forKey={description} />
          </div>
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
