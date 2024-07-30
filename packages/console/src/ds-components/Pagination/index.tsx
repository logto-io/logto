import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import ReactPaginate from 'react-paginate';

import useCacheValue from '@/hooks/use-cache-value';

import Button from '../Button';
import DangerousRaw from '../DangerousRaw';

import Next from './Next';
import Previous from './Previous';
import styles from './index.module.scss';

export type Props = {
  readonly page: number;
  readonly totalCount?: number;
  readonly pageSize: number;
  readonly className?: string;
  readonly mode?: 'normal' | 'pico';
  readonly onChange?: (pageIndex: number) => void;
};

function Pagination({ page, totalCount, pageSize, className, mode = 'normal', onChange }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  /**
   * Note:
   * The `totalCount` will become `undefined` temporarily when fetching data on page changes, and this causes the pagination to disappear.
   * Cache `totalCount` to solve this problem.
   */
  const cachedTotalCount = useCacheValue(totalCount) ?? 0;

  const pageCount = Math.ceil(cachedTotalCount / pageSize);

  if (pageCount <= 1) {
    return null;
  }

  const min = (page - 1) * pageSize + 1;
  const max = Math.min(page * pageSize, cachedTotalCount);
  const isPicoMode = mode === 'pico';

  return (
    <div className={classNames(styles.container, isPicoMode && styles.pico, className)}>
      <div className={styles.positionInfo}>
        {t('general.page_info', { min, max, total: cachedTotalCount })}
      </div>
      <ReactPaginate
        className={styles.pagination}
        pageCount={pageCount}
        forcePage={page - 1}
        pageLabelBuilder={(pageNumber: number) => (
          <Button
            type={pageNumber === page ? 'outline' : 'default'}
            className={classNames(styles.button, pageNumber === page && styles.active)}
            size="small"
            title={<DangerousRaw>{pageNumber}</DangerousRaw>}
          />
        )}
        previousLabel={
          <Button
            className={styles.button}
            size="small"
            icon={<Previous />}
            disabled={page === 1}
          />
        }
        nextLabel={
          <Button
            className={styles.button}
            size="small"
            icon={<Next />}
            disabled={page === pageCount}
          />
        }
        breakLabel={
          <Button className={styles.button} size="small" title={<DangerousRaw>...</DangerousRaw>} />
        }
        disabledClassName={styles.disabled}
        pageRangeDisplayed={isPicoMode ? -1 : undefined}
        marginPagesDisplayed={isPicoMode ? 0 : undefined}
        onPageChange={({ selected }) => {
          onChange?.(selected + 1);
        }}
      />
    </div>
  );
}

export default Pagination;
