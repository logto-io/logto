import Spacer from '@/components/Spacer';

import * as styles from './index.module.scss';

const DetailsSkeleton = () => (
  <div className={styles.container}>
    <div className={styles.header}>
      <div className={styles.icon} />
      <div className={styles.wrapper}>
        <div className={styles.title} />
        <div className={styles.tags} />
      </div>
      <Spacer />
      <div className={styles.button} />
    </div>
    <div className={styles.content}>
      <div className={styles.tabBar} />
      {Array.from({ length: 4 }).map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={index} className={styles.field} />
      ))}
      <Spacer />
      <div className={styles.footer}>
        <div className={styles.button} />
      </div>
    </div>
  </div>
);

export default DetailsSkeleton;
