import type { ReactNode } from 'react';

import * as styles from './TableEmptyWrapper.module.scss';

type Props = {
  columns: number;
  children: ReactNode;
};

function TableEmptyWrapper({ columns, children }: Props) {
  return (
    <tr>
      <td colSpan={columns} className={styles.tableEmptyWrapper}>
        <div className={styles.content}>{children}</div>
      </td>
    </tr>
  );
}

export default TableEmptyWrapper;
