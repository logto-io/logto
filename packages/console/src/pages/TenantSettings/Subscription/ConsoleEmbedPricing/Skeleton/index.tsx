import styles from './index.module.scss';

function Skeleton() {
  return (
    <div className={styles.container}>
      {/* Header shimmer */}
      <div className={styles.headerRow}>
        {Array.from({ length: 3 }).map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} className={styles.shimmer} />
        ))}
      </div>

      {/* Content shimmer lines */}
      {Array.from({ length: 6 }).map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={index} className={styles.contentRow}>
          <div className={styles.shimmer} />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
