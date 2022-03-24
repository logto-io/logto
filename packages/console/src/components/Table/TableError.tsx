import React from 'react';
import { useTranslation } from 'react-i18next';

import ErrorImage from '@/assets/images/table-error.svg';

import Button from '../Button';
import * as styles from './TableError.module.scss';

type Props = {
  title?: string;
  content?: string;
  onRetry?: () => void;
};

const TableError = ({ title, content, onRetry }: Props) => {
  const { t } = useTranslation();

  return (
    <tr>
      <td colSpan={0}>
        <div className={styles.tableError}>
          <div className={styles.image}>
            <img src={ErrorImage} />
          </div>
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
