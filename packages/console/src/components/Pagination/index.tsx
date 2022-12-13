import classNames from 'classnames';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReactPaginate from 'react-paginate';

import Button from '../Button';
import DangerousRaw from '../DangerousRaw';
import Next from './Next';
import Previous from './Previous';
import * as styles from './index.module.scss';

type Props = {
  pageIndex: number;
  totalCount?: number;
  pageSize: number;
  className?: string;
  onChange?: (pageIndex: number) => void;
};

const Pagination = ({ pageIndex, totalCount, pageSize, className, onChange }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  /**
   * Note:
   * The `totalCount` will become `undefined` temporarily when fetching data on page changes, and this causes the pagination to disappear.
   * Cache `totalCount` to solve this problem.
   */
  const totalCountRef = useRef(totalCount);
  const cachedTotalCount = useMemo(() => {
    if (totalCount === undefined) {
      if (totalCountRef.current === undefined) {
        return 0;
      }

      return totalCountRef.current;
    }

    // eslint-disable-next-line @silverhand/fp/no-mutation
    totalCountRef.current = totalCount;

    return totalCount;
  }, [totalCount]);

  const pageCount = Math.ceil(cachedTotalCount / pageSize);

  if (pageCount <= 1) {
    return null;
  }

  const min = (pageIndex - 1) * pageSize + 1;
  const max = Math.min(pageIndex * pageSize, cachedTotalCount);

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.positionInfo}>
        {t('general.page_info', { min, max, total: cachedTotalCount })}
      </div>
      <ReactPaginate
        className={styles.pagination}
        pageCount={pageCount}
        forcePage={pageIndex - 1}
        pageLabelBuilder={(page: number) => (
          <Button
            type={page === pageIndex ? 'outline' : 'default'}
            className={classNames(styles.button, page === pageIndex && styles.active)}
            size="small"
            title={<DangerousRaw>{page}</DangerousRaw>}
          />
        )}
        previousLabel={<Button className={styles.button} size="small" icon={<Previous />} />}
        nextLabel={<Button className={styles.button} size="small" icon={<Next />} />}
        breakLabel={
          <Button className={styles.button} size="small" title={<DangerousRaw>...</DangerousRaw>} />
        }
        disabledClassName={styles.disabled}
        onPageChange={({ selected }) => {
          onChange?.(selected + 1);
        }}
      />
    </div>
  );
};

export default Pagination;
