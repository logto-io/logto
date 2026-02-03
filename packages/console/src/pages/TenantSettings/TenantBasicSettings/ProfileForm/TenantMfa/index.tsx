import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Switch from '@/ds-components/Switch';

import { type TenantSettingsForm } from '../../types.js';

import useTenantMfaFeature from './use-tenant-mfa-feature.js';

function TenantMfa() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { isFeatureAvailable } = useTenantMfaFeature();
  const { control } = useFormContext<TenantSettingsForm>();

  return (
    <Controller
      name="isMfaRequired"
      control={control}
      render={({ field: { value, onChange } }) => (
        <Switch
          label={t('tenants.settings.tenant_mfa_description')}
          disabled={!isFeatureAvailable}
          checked={value}
          onChange={({ currentTarget: { checked } }) => {
            onChange(checked);
          }}
        />
      )}
    />
  );
}

export default TenantMfa;

export { default as useTenantMfaFeature } from './use-tenant-mfa-feature.js';
