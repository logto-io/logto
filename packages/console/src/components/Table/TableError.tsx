import React from 'react';
import { useTranslation } from 'react-i18next';

import ErrorImage from '@/assets/images/table-error.svg';

import Button from '../Button';
import * as styles from './TableError.module.scss';

type Props = {
  title?: string;
  content?: string;
  onRetry?: () => void;
  columns: number;
};

const TableError = ({ title, content, onRetry, columns }: Props) => {
  const { t } = useTranslation();

  return (
    <tr>
      <td colSpan={columns}>
        <div className={styles.tableError}>
          <img src={ErrorImage} />
          <div className={styles.title}>
            {title ?? t('admin_console.errors.something_went_wrong')}
          </div>
          <div className={styles.content}>
            {content ?? t('admin_console.errors.unknown_server_error')}
          </div>
          {onRetry && <Button title="general.retry" onClick={onRetry} />}
        </div>
      </td>
    </tr>
  );
};

export default TableError;
