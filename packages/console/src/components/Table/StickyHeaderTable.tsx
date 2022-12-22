import { assert } from '@silverhand/essentials';
import classNames from 'classnames';
import type { ReactElement } from 'react';

import * as styles from './StickyHeaderTable.module.scss';

type Props = {
  header: ReactElement<HTMLTableSectionElement>;
  colGroup?: ReactElement<HTMLTableColElement>;
  className?: string;
  children: ReactElement<HTMLTableSectionElement>;
};

const StickyHeaderTable = ({ header, colGroup, className, children: body }: Props) => {
  assert(header.props.tagName !== 'THEAD', new Error('Expected <thead> for the `header` prop'));

  assert(
    colGroup?.props.tagName !== 'COLGROUP',
    new Error('Expected <colgroup> for the `colGroup` prop')
  );

  assert(body.props.tagName !== 'TBODY', new Error('Expected <tbody> for the `children` prop'));

  return (
    <div className={classNames(styles.container, className)}>
      <table>
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
