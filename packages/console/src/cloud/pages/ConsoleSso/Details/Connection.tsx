import { type consoleSsoRouter } from '@logto/cloud/routes';
import { SsoProviderType } from '@logto/schemas';
import cleanDeep from 'clean-deep';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { toastResponseError, useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type ConsoleSsoConnector } from '@/cloud/types/router';
import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import OidcMetadataForm from '@/pages/EnterpriseSsoDetails/Connection/OidcMetadataForm';
import SamlAttributeMapping from '@/pages/EnterpriseSsoDetails/Connection/SamlAttributeMapping';
import SamlMetadataForm from '@/pages/EnterpriseSsoDetails/Connection/SamlMetadataForm';
import {
  type OidcConnectorConfig,
  oidcConnectorConfigGuard,
  oidcProviderConfigGuard,
} from '@/pages/EnterpriseSsoDetails/types/oidc';
import {
  type SamlConnectorConfig,
  samlConnectorConfigGuard,
  samlProviderConfigGuard,
} from '@/pages/EnterpriseSsoDetails/types/saml';

import styles from './Connection.module.scss';

type Props = {
  readonly data: ConsoleSsoConnector;
  readonly isDeleted: boolean;
  readonly onUpdated: () => Promise<void>;
};

function OidcConnection({ data, isDeleted, onUpdated }: Props) {
  const api = useCloudApi<typeof consoleSsoRouter>({ hideErrorToast: true });
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const methods = useForm<OidcConnectorConfig>();
  const {
    formState: { isDirty, isSubmitting },
    handleSubmit,
    reset,
  } = methods;
  const config = useMemo(() => {
    const result = oidcConnectorConfigGuard.safeParse(data.config);
    return result.success ? result.data : {};
  }, [data.config]);
  const providerConfig = useMemo(
    () => oidcProviderConfigGuard.safeParse(data.providerConfig),
    [data.providerConfig]
  );

  useEffect(() => {
    reset(config);
  }, [config, reset]);

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const updated = await api.patch('/api/me/console-sso/connectors/:connectorId', {
        params: { connectorId: data.id },
        body: { config: cleanDeep(formData) },
      });
      reset(oidcConnectorConfigGuard.parse(updated.config));
      toast.success(t('general.saved'));
      await onUpdated();
    } catch (error) {
      await onUpdated();
      await toastResponseError(error);
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
          <OidcMetadataForm
            providerName={data.providerName}
            config={config}
            providerConfig={providerConfig.success ? providerConfig.data : undefined}
          />
        </FormCard>
        <FormCard
          title="enterprise_sso_details.service_provider_property_title"
          description="enterprise_sso_details.service_provider_property_description"
          descriptionInterpolation={{ protocol: 'OIDC' }}
        >
          <FormField title="enterprise_sso.basic_info.oidc.redirect_uri_field_name">
            {data.redirectUri && (
              <CopyToClipboard displayType="block" variant="border" value={data.redirectUri} />
            )}
          </FormField>
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} />
    </FormProvider>
  );
}

function SamlConnection({ data, isDeleted, onUpdated }: Props) {
  const api = useCloudApi<typeof consoleSsoRouter>({ hideErrorToast: true });
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const methods = useForm<SamlConnectorConfig>();
  const {
    formState: { isDirty, isSubmitting },
    handleSubmit,
    reset,
  } = methods;
  const config = useMemo(() => {
    const result = samlConnectorConfigGuard.safeParse(data.config);
    return result.success ? result.data : {};
  }, [data.config]);
  const providerConfig = useMemo(
    () => samlProviderConfigGuard.safeParse(data.providerConfig),
    [data.providerConfig]
  );
  const parsedProviderConfig = providerConfig.success ? providerConfig.data : undefined;

  useEffect(() => {
    reset(config);
  }, [config, reset]);

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const updated = await api.patch('/api/me/console-sso/connectors/:connectorId', {
        params: { connectorId: data.id },
        body: { config: cleanDeep(formData) },
      });
      reset(samlConnectorConfigGuard.parse(updated.config));
      toast.success(t('general.saved'));
      await onUpdated();
    } catch (error) {
      await onUpdated();
      await toastResponseError(error);
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
          title="enterprise_sso_details.upload_idp_metadata_title_saml"
          description="enterprise_sso_details.upload_idp_metadata_description_saml"
        >
          <div className={styles.samlMetadataForm}>
            <SamlMetadataForm config={config} providerConfig={parsedProviderConfig} />
          </div>
        </FormCard>
        <FormCard
          title="enterprise_sso_details.service_provider_property_title"
          description="enterprise_sso_details.service_provider_property_description"
          descriptionInterpolation={{ protocol: 'SAML 2.0' }}
        >
          <FormField title="enterprise_sso.basic_info.saml.acs_url_field_name">
            <CopyToClipboard
              displayType="block"
              variant="border"
              value={parsedProviderConfig?.serviceProvider.assertionConsumerServiceUrl ?? ''}
            />
          </FormField>
          <FormField title="enterprise_sso.basic_info.saml.audience_uri_field_name">
            <CopyToClipboard
              displayType="block"
              variant="border"
              value={parsedProviderConfig?.serviceProvider.entityId ?? ''}
            />
          </FormField>
        </FormCard>
        <FormCard
          title="enterprise_sso_details.attribute_mapping_title"
          description="enterprise_sso_details.attribute_mapping_description"
        >
          <SamlAttributeMapping samlProviderConfig={parsedProviderConfig} />
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} />
    </FormProvider>
  );
}

function Connection(props: Props) {
  if (props.data.providerType === SsoProviderType.SAML) {
    return <SamlConnection {...props} />;
  }
  return <OidcConnection {...props} />;
}

export default Connection;
