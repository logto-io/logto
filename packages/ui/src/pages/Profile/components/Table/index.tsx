import type { I18nKey } from '@logto/phrases-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

export type Row = {
  label: I18nKey;
  value: unknown;
  renderer?: (value: unknown) => ReactNode;
};

type Props = {
  title: I18nKey;
  data: Row[];
};

const defaultRenderer = (value: unknown) => (value ? String(value) : '-');

const Table = ({ title, data }: Props) => {
  const { t } = useTranslation();

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

export default Table;
