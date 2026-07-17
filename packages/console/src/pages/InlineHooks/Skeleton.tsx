import Card from '@/ds-components/Card';

import { inlineHookCatalog } from './constants';
import styles from './index.module.scss';

function Skeleton() {
  return (
    <div className={styles.cardList} role="status" aria-label="Loading...">
      {inlineHookCatalog.map(({ hookType }) => (
        <Card key={hookType} className={styles.skeletonCard}>
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
