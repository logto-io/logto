import type { AdminConsoleKey } from '@logto/phrases';
import { TenantTag } from '@logto/schemas';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';

import { type TenantSettingsForm } from '../types.js';

import TenantEnvironment from './TenantEnvironment/index.js';
import TenantRegion from './TenantRegion/index.js';

type Props = {
  currentTenantId: string;
};

const tagOptions: Array<{
  title: AdminConsoleKey;
  value: TenantTag;
}> = [
  {
    title: 'tenants.settings.environment_tag_development',
    value: TenantTag.Development,
  },
  {
    title: 'tenants.settings.environment_tag_staging',
    value: TenantTag.Staging,
  },
  {
    title: 'tenants.settings.environment_tag_production',
    value: TenantTag.Production,
  },
];

function ProfileForm({ currentTenantId }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    control,
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
