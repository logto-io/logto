import type { AdminConsoleKey } from '@logto/phrases';
import type { Nullable } from '@silverhand/essentials';
import type { ReactElement } from 'react';
import { cloneElement } from 'react';

import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';

import NotSet from '../NotSet';

import styles from './index.module.scss';

type Action = {
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
  readonly title: AdminConsoleKey;
  readonly data: Array<Row<T>>;
};

function CardContent<T extends Nullable<boolean | string | Record<string, unknown>> | undefined>({
  title,
  data,
}: Props<T>) {
  const defaultRenderer = (value: unknown) => (value ? <span>{String(value)}</span> : <NotSet />);

  if (data.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <DynamicT forKey={title} />
      </div>
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
                    {typeof label === 'string' ? <DynamicT forKey={label} /> : label}
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
}

export default CardContent;
