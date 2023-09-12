import { type AdminConsoleKey } from '@logto/phrases';
import { type ReactElement, cloneElement } from 'react';

import DynamicT from '@/ds-components/DynamicT';

import * as styles from './index.module.scss';

type Props = {
  title: AdminConsoleKey;
  description: AdminConsoleKey;
  icon: ReactElement;
};

function FactorLabel({ title, description, icon }: Props) {
  return (
    <div className={styles.factorLabel}>
      <div className={styles.factorTitle}>
        {cloneElement(icon, { className: styles.factorIcon })}
        <DynamicT forKey={title} />
      </div>
      <div>
        <DynamicT forKey={description} />
      </div>
    </div>
  );
}

export default FactorLabel;
