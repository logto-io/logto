import * as styles from './TableLoading.module.scss';

type Props = {
  columns: number;
};

const TableLoading = ({ columns }: Props) => {
  return (
    <>
      {Array.from({ length: 8 }).map((_, rowIndex) => (
        // eslint-disable-next-line react/no-array-index-key
        <tr key={`row-${rowIndex}`} className={styles.loading}>
          <td>
            <div className={styles.itemPreview}>
              <div className={styles.avatar} />
              <div className={styles.content}>
                <div className={styles.title} />
                <div className={styles.subTitle} />
              </div>
            </div>
          </td>
          {Array.from({ length: columns - 1 }).map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <td key={index}>
              <div className={styles.rect} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default TableLoading;
