import React, { ReactNode } from 'react';

import * as styles from './TableLoading.module.scss';

export { default as ItemPreviewLoading } from './ItemPreviewLoading';

type Props = {
  children: ReactNode;
};

const TableLoading = ({ children }: Props) => (
  <>
    <tr className={styles.loading}>{children}</tr>
    <tr className={styles.loading}>{children}</tr>
  </>
);

export default TableLoading;
