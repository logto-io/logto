import { AppearanceMode } from '@logto/schemas';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import EmptyDark from '@/assets/images/table-empty-dark.svg';
import Empty from '@/assets/images/table-empty.svg';
import { useTheme } from '@/hooks/use-theme';

import * as styles from './TableEmpty.module.scss';

type Props = {
  title?: string;
  description?: string;
  image?: ReactNode;
  children?: ReactNode;
  columns: number;
};

const TableEmpty = ({ title, description, image, children, columns }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const theme = useTheme();

  return (
    <tr>
      <td colSpan={columns} className={styles.tableEmptyTableData}>
        <div className={styles.tableEmpty}>
          {image ?? (theme === AppearanceMode.LightMode ? <Empty /> : <EmptyDark />)}
          <div className={styles.title}>{title ?? t('errors.empty')}</div>
          {description && <div className={styles.description}>{description}</div>}
          {children}
        </div>
      </td>
    </tr>
  );
};

export default TableEmpty;
