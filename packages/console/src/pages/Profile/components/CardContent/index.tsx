import type { AdminConsoleKey } from '@logto/phrases';
import type { Nullable } from '@silverhand/essentials';
import type { ReactElement } from 'react';
import { cloneElement } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';

import NotSet from '../NotSet';
import * as styles from './index.module.scss';

export type Action = {
  name: AdminConsoleKey;
  handler: () => void;
};

export type Row<T> = {
  key: string;
  icon?: ReactElement;
  label: AdminConsoleKey | ReactElement;
  value: T;
  renderer?: (value: T) => ReactElement;
  action: Action | Action[];
};

type Props<T> = {
  title: AdminConsoleKey;
  data: Array<Row<T>>;
};

const CardContent = <T extends Nullable<boolean | string | Record<string, unknown>> | undefined>({
  title,
  data,
}: Props<T>) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const defaultRenderer = (value: unknown) => (value ? <span>{String(value)}</span> : <NotSet />);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>{t(title)}</div>
      <table>
        <tbody>
          {data.map(({ key, icon, label, value, renderer = defaultRenderer, action }) => {
            const actions = Array.isArray(action) ? action : [action];

            return (
              <tr key={key}>
                <td>
                  <div className={styles.wrapper}>
                    {icon &&
                      cloneElement(icon, {
                        className: styles.icon,
                      })}
                    {typeof label === 'string' ? t(label) : label}
                  </div>
                </td>
                <td>{renderer(value)}</td>
                <td>
                  <div className={styles.wrapper}>
                    {actions.map(({ name, handler }) => (
                      <Button
                        key={name}
                        className={styles.actionButton}
                        type="text"
                        size="small"
                        title={name}
                        onClick={handler}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CardContent;
