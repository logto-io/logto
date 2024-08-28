import * as styles from './index.module.scss';

type Props = {
  readonly columnSpans: number[];
  /** For the compact inline style table */
  readonly isCompact?: boolean;
};

function Skeleton({ columnSpans, isCompact }: Props) {
  if (isCompact) {
    return (
      <>
        {Array.from({ length: 2 }).map((_, rowIndex) => (
          // eslint-disable-next-line react/no-array-index-key
          <tr key={`row-${rowIndex}`}>
            {columnSpans.map((colSpan, columnIndex) => (
              // eslint-disable-next-line react/no-array-index-key
              <td key={columnIndex} colSpan={colSpan}>
                <div className={styles.rect} />
              </td>
            ))}
          </tr>
        ))}
      </>
    );
  }
  return (
    <>
      {Array.from({ length: 8 }).map((_, rowIndex) => (
        // eslint-disable-next-line react/no-array-index-key
        <tr key={`row-${rowIndex}`} className={styles.row}>
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
}

export default Skeleton;
