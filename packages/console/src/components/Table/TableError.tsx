import { AppearanceMode } from '@logto/schemas';
import React from 'react';
import { useTranslation } from 'react-i18next';

import ErrorDark from '@/assets/images/error-dark.svg';
import Error from '@/assets/images/error.svg';
import { useTheme } from '@/hooks/use-theme';

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
  const theme = useTheme();

  return (
    <tr>
      <td colSpan={columns}>
        <div className={styles.tableError}>
          {theme === AppearanceMode.LightMode ? <Error /> : <ErrorDark />}
          <div className={styles.title}>
            {title ?? t('admin_console.errors.something_went_wrong')}
          </div>
          <div className={styles.content}>
            {content ?? t('admin_console.errors.unknown_server_error')}
          </div>
          {onRetry && <Button title="admin_console.general.retry" onClick={onRetry} />}
        </div>
      </td>
    </tr>
  );
};

export default TableError;
