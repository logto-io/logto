import classNames from 'classnames';
import ReactPaginate from 'react-paginate';

import Button from '../Button';
import DangerousRaw from '../DangerousRaw';
import Next from './Next';
import Previous from './Previous';
import * as styles from './index.module.scss';

type Props = {
  pageIndex: number;
  pageCount: number;
  onChange?: (pageIndex: number) => void;
};

const Pagination = ({ pageIndex, pageCount, onChange }: Props) => {
  return (
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
  );
};

export default Pagination;
