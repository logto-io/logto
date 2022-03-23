import React from 'react';
import { useTranslation } from 'react-i18next';

import ErrorImage from '@/assets/images/table-error.svg';

import Button from '../Button';
import * as styles from './TableError.module.scss';

type Props = {
  title?: string;
  content?: string;
  onTryAgain?: () => void;
};

const TableError = ({ title, content, onTryAgain }: Props) => {
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
          {onTryAgain && <Button title="general.try_again" onClick={onTryAgain} />}
        </div>
      </td>
    </tr>
  );
};

export default TableError;
