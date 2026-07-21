import Card from '@/ds-components/Card';

import { actionCatalog } from './constants';
import styles from './index.module.scss';

function Skeleton() {
  return (
    <div className={styles.cardList} role="status" aria-label="Loading...">
      {actionCatalog.map(({ actionType }) => (
        <Card key={actionType} className={styles.skeletonCard}>
          <div className={styles.skeletonIcon} />
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonDescription} />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default Skeleton;
