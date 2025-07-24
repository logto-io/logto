import { type AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import type { HTMLProps, ReactElement, ReactNode, Ref } from 'react';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

import DynamicT from '../DynamicT';
import Tooltip from '../Tip/Tooltip';

import styles from './index.module.scss';

type BaseProps = {
  readonly hasError?: boolean;
  readonly tooltip?: ReactNode;
};

type Props =
  | (Omit<HTMLProps<HTMLInputElement>, 'label'> &
      BaseProps & {
        /** @deprecated Use `description` instead */
        readonly label?: ReactNode;
      })
  | (HTMLProps<HTMLInputElement> &
      BaseProps & {
        readonly description: AdminConsoleKey | ReactElement;
      });

function Switch(props: Props, ref?: Ref<HTMLInputElement>) {
  const { label, hasError, tooltip, ...rest } = props;
  const { i18n } = useTranslation();

  const switchElement = (
    <label className={classNames(styles.switch, styles[i18n.dir()])}>
      <input type="checkbox" {...rest} ref={ref} />
      <span className={styles.slider} />
    </label>
  );

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
      {tooltip ? <Tooltip content={tooltip}>{switchElement}</Tooltip> : switchElement}
    </div>
  );
}

export default forwardRef<HTMLInputElement, Props>(Switch);
