import DataEmpty from '@/components/DataEmpty';
import type { Props as DataEmptyProps } from '@/components/DataEmpty';

import * as styles from './TableEmpty.module.scss';

type Props = DataEmptyProps & {
  columns: number;
};

const TableEmpty = ({ columns, ...emptyProps }: Props) => (
  <tr>
    <td colSpan={columns} className={styles.tableEmptyTableData}>
      <DataEmpty {...emptyProps} />
    </td>
  </tr>
);

export default TableEmpty;
