import styles from './index.module.scss';

function StepsSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, stepIndex) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={stepIndex} className={styles.step}>
          <div className={styles.index} />
          <div className={styles.wrapper}>
            <div className={styles.title} />
            <div className={styles.subtitle} />
          </div>
        </div>
      ))}
    </>
  );
}

export default StepsSkeleton;
