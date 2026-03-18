import Button from '@experience/shared/components/Button';
import { AccountCenterControlValue } from '@logto/schemas';
import type { TFuncKey } from 'i18next';
import { useTranslation } from 'react-i18next';

import styles from './index.module.scss';

export type FieldRowProps = {
  readonly label: string;
  readonly value?: string;
  readonly actionKey?: TFuncKey;
  readonly onAction?: () => void;
};

export const FieldRow = ({ label, value, actionKey, onAction }: FieldRowProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.fieldRow}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={`${styles.fieldValue}${value ? '' : ` ${styles.notSet}`}`}>
        {value ?? t('account_center.home.not_set')}
      </span>
      {actionKey && onAction && (
        <div className={styles.fieldAction}>
          <Button title={actionKey} type="secondary" size="small" onClick={onAction} />
        </div>
      )}
    </div>
  );
};

export const editAction = (
  controlValue: AccountCenterControlValue | undefined,
  hasValue: boolean
): TFuncKey | undefined =>
  controlValue === AccountCenterControlValue.Edit
    ? hasValue
      ? 'account_center.home.action_edit'
      : 'account_center.home.action_add'
    : undefined;
