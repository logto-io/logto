import { type CimdConfig, type SnakeCaseOidcConfig } from '@logto/schemas';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';

import DetailsForm from '@/components/DetailsForm';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { isDevFeaturesEnabled } from '@/consts/env';
import useApi from '@/hooks/use-api';
import { cimdConfigEndpoint } from '@/hooks/use-dynamic-app';
import { trySubmitSafe } from '@/utils/form';

import ClientCompatibility from './ClientCompatibility';
import EndpointsAndCredentials from './EndpointsAndCredentials';
import Settings from './Settings';
import { type SettingsFormData } from './types';

type Props = {
  readonly data: CimdConfig;
  readonly oidcConfig: SnakeCaseOidcConfig;
};

const toFormData = ({ addConsentPromptForOfflineAccess }: CimdConfig): SettingsFormData => ({
  addConsentPromptForOfflineAccess: addConsentPromptForOfflineAccess ?? false,
});

function SettingsForm({ data, oidcConfig }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const { mutate } = useSWRConfig();

  const formMethods = useForm<SettingsFormData>({ defaultValues: toFormData(data) });
  const {
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = formMethods;

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      const updated = await api.patch(cimdConfigEndpoint, { json: formData }).json<CimdConfig>();

      reset(toFormData(updated));
      void mutate(cimdConfigEndpoint, updated, { revalidate: false });
      toast.success(t('general.saved'));
    })
  );

  return (
    <>
      <FormProvider {...formMethods}>
        <DetailsForm
          isDirty={isDirty}
          isSubmitting={isSubmitting}
          onDiscard={reset}
          onSubmit={onSubmit}
        >
          <Settings />
          <EndpointsAndCredentials oidcConfig={oidcConfig} />
          {/* DEV: MCP client compatibility */}
          {isDevFeaturesEnabled && <ClientCompatibility />}
        </DetailsForm>
      </FormProvider>
      <UnsavedChangesAlertModal hasUnsavedChanges={isDirty} onConfirm={reset} />
    </>
  );
}

export default SettingsForm;
