import { type LogtoErrorCode } from '@logto/phrases';
import { type RequestErrorBody } from '@logto/schemas';
import cleanDeep from 'clean-deep';
import { HTTPError } from 'ky';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import useApi from '@/hooks/use-api';
import {
  samlConnectorConfigGuard,
  samlProviderConfigGuard,
  type SamlConnectorConfig,
  type SamlSsoConnectorWithProviderConfig,
} from '@/pages/EnterpriseSsoDetails/types/saml';
import { trySubmitSafe } from '@/utils/form';

import { invalidConfigErrorCode, invalidMetadataErrorCode } from '../config';

import SamlAttributeMapping from './SamlAttributeMapping';
import SamlMetadataForm from './SamlMetadataForm';
import SamlConnectorSpInfo from './ServiceProviderInfo/SamlConnectorSpInfo';
import * as styles from './index.module.scss';

type Props = {
  isDeleted: boolean;
  data: SamlSsoConnectorWithProviderConfig;
  onUpdated: (data: SamlSsoConnectorWithProviderConfig) => void;
};

const manualHandleErrorCodes: LogtoErrorCode[] = [invalidConfigErrorCode, invalidMetadataErrorCode];

function SamlConnectorForm({ isDeleted, data, onUpdated }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const api = useApi({ hideErrorToast: manualHandleErrorCodes });
  const methods = useForm<SamlConnectorConfig>();

  const {
    formState: { isSubmitting, isDirty },
    handleSubmit,
    reset,
    setError,
  } = methods;

  const { config, providerConfig, id: connectorId } = data;

  // Guard the config data
  const samlConnectorConfig = useMemo(() => {
    const result = samlConnectorConfigGuard.safeParse(config);
    const { success } = result;
    const guardedConfig = success ? result.data : undefined;

    return guardedConfig;
  }, [config]);

  // Guard the provider config data
  const samlProviderConfig = useMemo(() => {
    const result = samlProviderConfigGuard.safeParse(providerConfig);
    const { success } = result;
    const guardedConfig = success ? result.data : undefined;

    return guardedConfig;
  }, [providerConfig]);

  useEffect(() => {
    reset(samlConnectorConfig);
  }, [samlConnectorConfig, reset]);

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      if (isSubmitting) {
        return;
      }

      try {
        const result = await api
          .patch(`api/sso-connectors/${connectorId}`, {
            json: { config: cleanDeep(formData) },
          })
          .json<SamlSsoConnectorWithProviderConfig>();

        toast.success(t('general.saved'));

        onUpdated(result);

        reset(result.config);
      } catch (error: unknown) {
        if (error instanceof HTTPError) {
          const errorBody = await error.response.clone().json<RequestErrorBody>();

          // Manually handle the error to show the error message in the form.
          if (manualHandleErrorCodes.includes(errorBody.code)) {
            const errorFormKey = formData.metadataUrl ? 'metadataUrl' : 'metadata';

            setError(errorFormKey, { type: 'custom', message: errorBody.message });
            return;
          }
        }

        throw error;
      }
    })
  );

  return (
    <FormProvider {...methods}>
      <DetailsForm
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onDiscard={reset}
        onSubmit={onSubmit}
      >
        <FormCard
          title="enterprise_sso_details.upload_idp_metadata_title_saml"
          description="enterprise_sso_details.upload_idp_metadata_description_saml"
        >
          <div className={styles.samlMetadataForm}>
            <SamlMetadataForm config={samlConnectorConfig} providerConfig={samlProviderConfig} />
          </div>
        </FormCard>
        <FormCard
          title="enterprise_sso_details.service_provider_property_title"
          description="enterprise_sso_details.service_provider_property_description"
          descriptionInterpolation={{
            protocol: 'SAML 2.0',
          }}
        >
          <SamlConnectorSpInfo samlProviderConfig={samlProviderConfig} />
        </FormCard>
        <FormCard
          title="enterprise_sso_details.attribute_mapping_title"
          description="enterprise_sso_details.attribute_mapping_description"
        >
          <SamlAttributeMapping samlProviderConfig={samlProviderConfig} />
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} />
    </FormProvider>
  );
}

export default SamlConnectorForm;
