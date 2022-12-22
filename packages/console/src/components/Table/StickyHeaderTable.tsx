import { assert } from '@silverhand/essentials';
import classNames from 'classnames';
import type { ReactElement } from 'react';
import type { ReactNode } from 'react-markdown/lib/react-markdown';

import * as styles from './StickyHeaderTable.module.scss';

type Props = {
  header: ReactElement<HTMLTableSectionElement>;
  colGroup?: ReactElement<HTMLTableColElement>;
  filter?: ReactNode;
  className?: string;
  children: ReactElement<HTMLTableSectionElement>;
};

const StickyHeaderTable = ({ header, colGroup, filter, className, children: body }: Props) => {
  assert(header.props.tagName !== 'THEAD', new Error('Expected <thead> for the `header` prop'));

  assert(
    colGroup?.props.tagName !== 'COLGROUP',
    new Error('Expected <colgroup> for the `colGroup` prop')
  );

  assert(body.props.tagName !== 'TBODY', new Error('Expected <tbody> for the `children` prop'));

  return (
    <div className={classNames(styles.container, className)}>
      {filter && <div className={styles.filter}>{filter}</div>}
      <table className={classNames(styles.headerTable, filter && styles.hideTopBorderRadius)}>
        {colGroup}
        {header}
      </table>
      <div className={styles.bodyTable}>
        <table>
          {colGroup}
          {body}
        </table>
      </div>
    </div>
  );
};

export default StickyHeaderTable;
