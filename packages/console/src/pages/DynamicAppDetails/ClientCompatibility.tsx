import { useFormContext } from 'react-hook-form';

import FormCard from '@/components/FormCard';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';

import { type SettingsFormData } from './types';

function ClientCompatibility() {
  const { register } = useFormContext<SettingsFormData>();

  return (
    <FormCard
      title="applications.dynamic_app.client_compatibility.title"
      description="applications.dynamic_app.client_compatibility.description"
    >
      <FormField title="applications.dynamic_app.client_compatibility.add_consent_prompt_for_offline_access">
        <Switch
          description="applications.dynamic_app.client_compatibility.add_consent_prompt_for_offline_access_description"
          {...register('addConsentPromptForOfflineAccess')}
        />
      </FormField>
    </FormCard>
  );
}

export default ClientCompatibility;
