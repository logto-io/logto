import { type AdminConsoleKey } from '@logto/phrases';

import DynamicT from '@/ds-components/DynamicT';

import * as styles from './index.module.scss';

export type Props = {
  title: AdminConsoleKey;
  description: AdminConsoleKey;
};

function PolicyOptionTitle({ title, description }: Props) {
  return (
    <div className={styles.policyLabel}>
      <div>
        <DynamicT forKey={title} />
      </div>
      <div className={styles.description}>
        <DynamicT forKey={description} />
      </div>
    </div>
  );
}

export default PolicyOptionTitle;
