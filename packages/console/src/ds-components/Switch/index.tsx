import { type AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import type { HTMLProps, ReactElement, ReactNode, Ref } from 'react';
import { forwardRef } from 'react';

import DynamicT from '../DynamicT';

import styles from './index.module.scss';

type Props =
  | (Omit<HTMLProps<HTMLInputElement>, 'label'> & {
      /** @deprecated Use `description` instead */
      readonly label?: ReactNode;
      readonly hasError?: boolean;
    })
  | (HTMLProps<HTMLInputElement> & {
      readonly description: AdminConsoleKey | ReactElement;
      readonly hasError?: boolean;
    });

function Switch(props: Props, ref?: Ref<HTMLInputElement>) {
  const { label, hasError, ...rest } = props;

  return (
    <div className={classNames(styles.wrapper, hasError && styles.error)}>
      {'description' in props && (
        <div className={styles.label}>
          {typeof props.description === 'string' ? (
            <DynamicT forKey={props.description} />
          ) : (
            props.description
          )}
        </div>
      )}
      {label && <div className={styles.label}>{label}</div>}
      <label className={styles.switch}>
        <input type="checkbox" {...rest} ref={ref} />
        <span className={styles.slider} />
      </label>
    </div>
  );
}

export default forwardRef<HTMLInputElement, Props>(Switch);
