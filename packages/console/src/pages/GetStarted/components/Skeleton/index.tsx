import * as styles from './index.module.scss';

const Skeleton = () => (
  <>
    {[...Array.from({ length: 5 }).keys()].map((key) => (
      <div key={key} className={styles.card}>
        <div className={styles.icon} />
        <div className={styles.wrapper}>
          <div className={styles.title} />
          <div className={styles.subtitle} />
        </div>
      </div>
    ))}
  </>
);

export default Skeleton;
