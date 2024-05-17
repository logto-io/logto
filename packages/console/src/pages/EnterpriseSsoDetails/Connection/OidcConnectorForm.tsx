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

import { invalidConfigErrorCode } from '../config';
import {
  type OidcSsoConnectorWithProviderConfig,
  type OidcConnectorConfig,
  oidcConnectorConfigGuard,
  oidcProviderConfigGuard,
} from '../types/oidc';

import OidcMetadataForm from './OidcMetadataForm';
import OidcConnectorSpInfo from './ServiceProviderInfo/OidcConnectorSpInfo';

type Props = {
  readonly isDeleted: boolean;
  readonly data: OidcSsoConnectorWithProviderConfig;
  readonly onUpdated: (data: OidcSsoConnectorWithProviderConfig) => void;
};

function OidcConnectorForm({ isDeleted, data, onUpdated }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi({ hideErrorToast: [invalidConfigErrorCode] });

  const methods = useForm<OidcConnectorConfig>();

  const {
    formState: { isSubmitting, isDirty },
    handleSubmit,
    reset,
    setError,
  } = methods;

  const { config, providerConfig, providerName, id: connectorId } = data;

  // Guard the config data
  const oidcConnectorConfig = useMemo(() => {
    const result = oidcConnectorConfigGuard.safeParse(config);
    const { success } = result;
    const guardedConfig = success ? result.data : undefined;

    return guardedConfig;
  }, [config]);

  const oidcProviderConfig = useMemo(() => {
    const result = oidcProviderConfigGuard.safeParse(providerConfig);
    const { success } = result;
    const guardedConfig = success ? result.data : undefined;

    return guardedConfig;
  }, [providerConfig]);

  useEffect(() => {
    reset(oidcConnectorConfig);
  }, [oidcConnectorConfig, reset]);

  const onSubmit = handleSubmit(async (formData) => {
    if (isSubmitting) {
      return;
    }

    try {
      const result = await api
        .patch(`api/sso-connectors/${connectorId}`, {
          json: {
            config: cleanDeep(formData),
          },
        })
        .json<OidcSsoConnectorWithProviderConfig>();

      toast.success(t('general.saved'));

      onUpdated(result);

      reset(result.config);
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const errorBody = await error.response.clone().json<RequestErrorBody>();

        // Manually handle the error to show the error message in the form.
        if (errorBody.code === invalidConfigErrorCode) {
          setError('issuer', {
            type: 'custom',
            message: errorBody.message,
          });
          return;
        }
      }

      throw error;
    }
  });

  return (
    <FormProvider {...methods}>
      <DetailsForm
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onDiscard={reset}
        onSubmit={onSubmit}
      >
        <FormCard
          title="enterprise_sso_details.upload_idp_metadata_title_oidc"
          description="enterprise_sso_details.upload_idp_metadata_description_oidc"
        >
          {/* Can not infer the type by narrowing down the value of `providerName`, so we need to cast it. */}
          <OidcMetadataForm
            providerName={providerName}
            config={oidcConnectorConfig}
            providerConfig={oidcProviderConfig}
          />
        </FormCard>
        <FormCard
          title="enterprise_sso_details.service_provider_property_title"
          description="enterprise_sso_details.service_provider_property_description"
          descriptionInterpolation={{
            protocol: 'OIDC',
          }}
        >
          <OidcConnectorSpInfo ssoConnectorId={connectorId} />
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} />
    </FormProvider>
  );
}

export default OidcConnectorForm;
