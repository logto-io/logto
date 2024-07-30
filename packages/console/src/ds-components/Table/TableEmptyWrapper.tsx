import type { ReactNode } from 'react';

import styles from './TableEmptyWrapper.module.scss';

type Props = {
  readonly columns: number;
  readonly children: ReactNode;
};

function TableEmptyWrapper({ columns, children }: Props) {
  return (
    <tr>
      <td colSpan={columns} className={styles.tableEmptyWrapper}>
        <div className={styles.content}>
          {/* Per design requirement, the empty placeholder should have a top and bottom spacing, and the space height aspect ratio is 2:3. */}
          <div className={styles.topSpace} />
          {children}
          <div className={styles.bottomSpace} />
        </div>
      </td>
    </tr>
  );
}

export default TableEmptyWrapper;
