import { ReservedPlanId } from '@logto/schemas';
import { useFormContext } from 'react-hook-form';

import FormCard from '@/components/FormCard';
import { isDevFeaturesEnabled } from '@/consts/env';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';

import { type TenantSettingsForm } from '../types.js';

import EnterpriseSso from './EnterpriseSso/index.js';
import TenantEnvironment from './TenantEnvironment/index.js';
import TenantMfa, { useTenantMfaFeature } from './TenantMfa/index.js';
import TenantRegion from './TenantRegion/index.js';

type Props = {
  readonly currentTenantId: string;
};

function ProfileForm({ currentTenantId }: Props) {
  const {
    access: { canManageTenant },
  } = useCurrentTenantScopes();
  const {
    register,
    formState: { errors },
    getValues,
  } = useFormContext<TenantSettingsForm>();
  const { isFreeOrDevPlan } = useTenantMfaFeature();

  return (
    <FormCard title="tenants.settings.title" description="tenants.settings.description">
      <FormField title="tenants.settings.tenant_id">
        <CopyToClipboard displayType="block" value={currentTenantId} variant="border" />
      </FormField>
      <FormField isRequired title="tenants.settings.tenant_name">
        <TextInput
          {...register('profile.name', { required: true })}
          readOnly={!canManageTenant}
          error={Boolean(errors.profile?.name)}
        />
      </FormField>
      <FormField title="tenants.settings.tenant_region">
        <TenantRegion />
      </FormField>
      <FormField title="tenants.settings.tenant_type">
        <TenantEnvironment tag={getValues('profile.tag')} />
      </FormField>
      {isDevFeaturesEnabled && canManageTenant && (
        <FormField
          title="tenants.settings.tenant_mfa"
          featureTag={{
            isVisible: isFreeOrDevPlan,
            plan: ReservedPlanId.Pro,
          }}
        >
          <TenantMfa />
        </FormField>
      )}
      <FormField title="tenants.settings.enterprise_sso">
        <EnterpriseSso />
      </FormField>
    </FormCard>
  );
}

export default ProfileForm;
