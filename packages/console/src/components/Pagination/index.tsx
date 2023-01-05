import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import ReactPaginate from 'react-paginate';

import useCacheValue from '@/hooks/use-cache-value';

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
  isTinyStyle?: boolean;
  onChange?: (pageIndex: number) => void;
};

const Pagination = ({
  pageIndex,
  totalCount,
  pageSize,
  className,
  isTinyStyle = false,
  onChange,
}: Props) => {
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

  const min = (pageIndex - 1) * pageSize + 1;
  const max = Math.min(pageIndex * pageSize, cachedTotalCount);

  const pageRangeConfig = conditional(
    isTinyStyle && {
      pageRangeDisplayed: -1,
      marginPagesDisplayed: 0,
    }
  );

  return (
    <div className={classNames(styles.container, isTinyStyle && styles.tiny, className)}>
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
        {...pageRangeConfig}
      />
    </div>
  );
};

export default Pagination;
