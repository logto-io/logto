import { FormCardSkeleton } from '@/components/FormCard';
import Spacer from '@/ds-components/Spacer';

import * as styles from './index.module.scss';

function Skeleton() {
  return (
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
      <div className={styles.tabBar} />
      <FormCardSkeleton />
    </div>
  );
}

export default Skeleton;
