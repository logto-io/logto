import type { AdminConsoleKey } from '@logto/phrases';
import type { Nullable } from '@silverhand/essentials';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

export type Row<T> = {
  label: AdminConsoleKey;
  value: T;
  renderer?: (value: T) => ReactNode;
};

type Props<T> = {
  title: AdminConsoleKey;
  data: Array<Row<T>>;
};

const CardContent = <T extends Nullable<string> | undefined>({ title, data }: Props<T>) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const defaultRenderer = (value: unknown) => (value ? String(value) : t('profile.not_set'));

  if (data.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>{t(title)}</div>
      <table>
        <tbody>
          {data.map(({ label, value, renderer = defaultRenderer }) => (
            <tr key={label}>
              <td>{t(label)}</td>
              <td>{renderer(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CardContent;
