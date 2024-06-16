import { type LocalePhrase } from '@logto/phrases';
import React, { type ReactNode, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

type CanBeArray<T> = T | T[];

type StepProps = {
  readonly children: ReactNode;
  readonly index?: number;
  readonly tKey: keyof LocalePhrase['translation']['admin_console']['connectors']['guide'];
};

export function Step({ children, index, tKey }: StepProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.connectors.guide' });

  return (
    <div className={styles.block}>
      <div className={styles.blockTitle}>
        <div className={styles.number}>{index}</div>
        <div>{t(tKey)}</div>
      </div>
      {children}
    </div>
  );
}

type Props = {
  readonly children: CanBeArray<ReactElement<StepProps, typeof Step> | boolean>;
};

function Steps({ children }: Props) {
  return (
    <>
      {React.Children.map(children, (child, index) => {
        return (
          typeof child !== 'boolean' &&
          React.cloneElement(child, { key: child.key, index: index + 1 })
        );
      })}
    </>
  );
}

export default Steps;
