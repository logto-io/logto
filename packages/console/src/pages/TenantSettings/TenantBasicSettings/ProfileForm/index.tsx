import { useFormContext } from 'react-hook-form';

import FormCard from '@/components/FormCard';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';

import { type TenantSettingsForm } from '../types.js';

import TenantEnvironment from './TenantEnvironment/index.js';
import TenantRegion from './TenantRegion/index.js';

type Props = {
  currentTenantId: string;
};

function ProfileForm({ currentTenantId }: Props) {
  const { canManageTenant } = useCurrentTenantScopes();
  const {
    register,
    formState: { errors },
    getValues,
  } = useFormContext<TenantSettingsForm>();

  return (
    <FormCard title="tenants.settings.title" description="tenants.settings.description">
      <FormField title="tenants.settings.tenant_id">
        <CopyToClipboard isFullWidth value={currentTenantId} variant="border" />
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
    </FormCard>
  );
}

export default ProfileForm;
