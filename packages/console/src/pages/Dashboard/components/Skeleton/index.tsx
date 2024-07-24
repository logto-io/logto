import Card from '@/ds-components/Card';

import styles from './index.module.scss';

function Skeleton() {
  return (
    <div>
      <div className={styles.blocks}>
        {[...Array.from({ length: 3 }).keys()].map((index) => (
          <Card key={index} className={styles.block}>
            <div className={styles.title} />
            <div className={styles.number} />
          </Card>
        ))}
      </div>
      <Card>
        <div className={styles.dau}>
          <div className={styles.title} />
          <div className={styles.number} />
        </div>
        <div className={styles.curve} />
        <div className={styles.activeBlocks}>
          {[...Array.from({ length: 2 }).keys()].map((index) => (
            <Card key={index} className={styles.block}>
              <div className={styles.title} />
              <div className={styles.number} />
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default Skeleton;
