import React, { useMemo } from 'react';

import ItemPreviewLoading from './ItemPreviewLoading';
import * as styles from './TableLoading.module.scss';

type Props = {
  columns: number;
};

const TableLoading = ({ columns }: Props) => {
  const row = useMemo(
    () => (
      <tr className={styles.loading}>
        <td>
          <ItemPreviewLoading />
        </td>
        {Array.from({ length: columns - 1 }).map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <td key={index}>
            <div className={styles.rect} />
          </td>
        ))}
      </tr>
    ),
    [columns]
  );

  return (
    <>
      {row}
      {row}
    </>
  );
};

export default TableLoading;
