import Spacer from '@/components/Spacer';

import * as styles from './index.module.scss';

const Skeleton = () => {
  return (
    <div className={styles.container}>
      <div className={styles.setup}>
        <div className={styles.title} />
        <div className={styles.subtitle} />
        <div className={styles.tabs} />
        <div className={styles.field} />
        <div className={styles.field} />
        <div className={styles.field} />
        <div className={styles.field} />
        <Spacer />
        <div className={styles.footer}>
          <div className={styles.button} />
        </div>
      </div>
      <div className={styles.preview}>
        <div className={styles.header}>
          <div className={styles.info}>
            <div className={styles.title} />
            <div className={styles.subtitle} />
          </div>
          <Spacer />
          <div className={styles.button} />
          <div className={styles.button} />
        </div>
        <div className={styles.content}>
          <div className={styles.mobile}>
            <div className={styles.logo} />
            <div className={styles.slogan} />
            <div className={styles.field} />
            <div className={styles.field} />
            <div className={styles.button} />
            <div className={styles.social} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
