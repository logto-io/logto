import * as styles from './index.module.scss';

function Skeleton() {
  return (
    <div className={styles.container}>
      {Array.from({ length: 2 }).map((_, sectionIndex) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={sectionIndex} className={styles.section}>
          <div className={styles.titleWrapper}>
            <div className={styles.title} />
          </div>
          <div className={styles.card}>
            <div className={styles.label} />
            <table className={styles.table}>
              <tbody>
                {Array.from({ length: 3 }).map((_, rowIndex) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <tr key={rowIndex}>
                    <td>
                      <div className={styles.item} />
                    </td>
                    <td>
                      <div className={styles.item} />
                    </td>
                    <td>
                      <div className={styles.item} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
