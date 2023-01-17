import * as styles from './TableLoading.module.scss';

type Props = {
  columnSpans: number[];
};

const TableLoading = ({ columnSpans }: Props) => {
  return (
    <>
      {Array.from({ length: 8 }).map((_, rowIndex) => (
        // eslint-disable-next-line react/no-array-index-key
        <tr key={`row-${rowIndex}`} className={styles.loading}>
          <td colSpan={columnSpans[0]}>
            <div className={styles.itemPreview}>
              <div className={styles.avatar} />
              <div className={styles.content}>
                <div className={styles.title} />
                <div className={styles.subTitle} />
              </div>
            </div>
          </td>
          {columnSpans.slice(1).map((colSpan, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <td key={index} colSpan={colSpan}>
              <div className={styles.rect} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default TableLoading;
