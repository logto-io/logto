import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import ReactPaginate from 'react-paginate';

import Button from '../Button';
import DangerousRaw from '../DangerousRaw';
import Next from './Next';
import Previous from './Previous';
import * as styles from './index.module.scss';

type Props = {
  pageIndex: number;
  totalCount: number;
  pageSize: number;
  onChange?: (pageIndex: number) => void;
};

const Pagination = ({ pageIndex, totalCount, pageSize, onChange }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const pageCount = Math.ceil(totalCount / pageSize);

  const min = (pageIndex - 1) * pageSize + 1;
  const max = pageIndex * pageSize;

  return (
    <div className={styles.container}>
      <div className={styles.positionInfo}>
        {t('general.page_info', { min, max, total: totalCount })}
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
