import { customTenantIdMaxLength } from '@logto/core-kit';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';

import styles from '../index.module.scss';
import { type CreateTenantData } from '../types';
import { validateCustomTenantId } from '../utils';

type Props = {
  readonly prefix: string;
  readonly isSubmitting: boolean;
};

function TenantIdField({ prefix, isSubmitting }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateTenantData>();

  return (
    <FormField title="tenants.create_modal.tenant_id">
      <div className={styles.tenantIdInput}>
        <span className={styles.tenantIdPrefix}>{prefix}</span>
        <TextInput
          {...register('tenantIdSuffix', {
            validate: (value) =>
              validateCustomTenantId(value, prefix) ||
              t('tenants.create_modal.tenant_id_invalid', {
                max: customTenantIdMaxLength,
              }),
          })}
          className={styles.tenantIdSuffix}
          placeholder={t('tenants.create_modal.tenant_id_placeholder')}
          error={Boolean(errors.tenantIdSuffix)}
          disabled={isSubmitting}
        />
      </div>
      {errors.tenantIdSuffix && <div className={styles.error}>{errors.tenantIdSuffix.message}</div>}
    </FormField>
  );
}

export default TenantIdField;
