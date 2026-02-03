import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Switch from '@/ds-components/Switch';

import { type TenantSettingsForm } from '../../types.js';

import useTenantMfaFeature from './use-tenant-mfa-feature.js';

type Props = {
  readonly isLoading: boolean;
  readonly hasError: boolean;
};

function TenantMfa({ isLoading, hasError }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { isFeatureAvailable } = useTenantMfaFeature();
  const { register } = useFormContext<TenantSettingsForm>();

  return (
    <Switch
      label={t('tenants.settings.tenant_mfa_description')}
      disabled={!isFeatureAvailable || isLoading || hasError}
      {...register('settings.isMfaRequired')}
    />
  );
}

export default TenantMfa;

export { default as useTenantMfaFeature } from './use-tenant-mfa-feature.js';
