import { SsoProviderName } from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';
import cleanDeep from 'clean-deep';
import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import useApi from '@/hooks/use-api';
import {
  type SsoConnectorWithProviderConfigWithGeneric,
  type ParsedSsoIdentityProviderConfig,
  type GuideFormType,
  type SsoConnectorConfig,
} from '@/pages/EnterpriseSso/types';
import { trySubmitSafe } from '@/utils/form';

import BasicInfo from './BasicInfo';
import OidcMetadataForm from './OidcMetadataForm';
import SamlAttributeMapping from './SamlAttributeMapping';
import SamlMetadataForm from './SamlMetadataForm';
import * as styles from './index.module.scss';

type Props<T extends SsoProviderName> = {
  isDeleted: boolean;
  data: SsoConnectorWithProviderConfigWithGeneric<T>;
  onUpdated: (data: SsoConnectorWithProviderConfigWithGeneric<T>) => void;
};

// This component contains only `data.config`.
function Connection<T extends SsoProviderName>({ isDeleted, data, onUpdated }: Props<T>) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { id: ssoConnectorId, providerName, providerConfig, config } = data;

  const api = useApi();

  const methods = useForm<GuideFormType<T>>();

  const {
    formState: { isSubmitting, isDirty },
    handleSubmit,
    reset,
  } = methods;

  useEffect(() => {
    reset(config);
  }, [config, reset]);

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      if (isSubmitting) {
        return;
      }

      const updatedSsoConnector = await api
        // TODO: @darcyYe add console test case to remove attribute mapping config.
        .patch(`api/sso-connectors/${ssoConnectorId}`, {
          json: { config: cleanDeep(formData) },
        })
        .json<SsoConnectorWithProviderConfigWithGeneric<T>>();

      toast.success(t('general.saved'));
      onUpdated(updatedSsoConnector);

      reset(updatedSsoConnector.config);
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
        {[SsoProviderName.OIDC, SsoProviderName.GOOGLE_WORKSPACE, SsoProviderName.OKTA].includes(
          providerName
        ) ? (
          <FormCard
            title="enterprise_sso_details.upload_idp_metadata_title_oidc"
            description="enterprise_sso_details.upload_idp_metadata_description_oidc"
          >
            {/* Can not infer the type by narrowing down the value of `providerName`, so we need to cast it. */}
            <OidcMetadataForm
              providerName={providerName}
              // eslint-disable-next-line no-restricted-syntax
              config={config as SsoConnectorConfig<SsoProviderName.OIDC>}
              providerConfig={
                // eslint-disable-next-line no-restricted-syntax
                providerConfig as Optional<ParsedSsoIdentityProviderConfig<SsoProviderName.OIDC>>
              }
            />
          </FormCard>
        ) : (
          <FormCard
            title="enterprise_sso_details.upload_idp_metadata_title_saml"
            description="enterprise_sso_details.upload_idp_metadata_description_saml"
          >
            {/* Can not infer the type by narrowing down the value of `providerName`, so we need to cast it. */}
            {/* Modify spacing between form fields and switch button of SAML metadata form. */}
            <div className={styles.samlMetadataForm}>
              <SamlMetadataForm
                // eslint-disable-next-line no-restricted-syntax
                config={config as SsoConnectorConfig<SsoProviderName.SAML>}
                providerConfig={
                  // eslint-disable-next-line no-restricted-syntax
                  providerConfig as Optional<ParsedSsoIdentityProviderConfig<SsoProviderName.SAML>>
                }
              />
            </div>
          </FormCard>
        )}
        <FormCard
          title="enterprise_sso_details.service_provider_property_title"
          description="enterprise_sso_details.service_provider_property_description"
          descriptionInterpolation={{
            protocol: [SsoProviderName.SAML, SsoProviderName.AZURE_AD].includes(providerName)
              ? 'SAML 2.0'
              : 'OIDC',
          }}
        >
          <BasicInfo
            ssoConnectorId={ssoConnectorId}
            providerName={providerName}
            providerConfig={providerConfig}
          />
        </FormCard>
        {[SsoProviderName.SAML, SsoProviderName.AZURE_AD].includes(providerName) && (
          <FormCard
            title="enterprise_sso_details.attribute_mapping_title"
            description="enterprise_sso_details.attribute_mapping_description"
          >
            <SamlAttributeMapping providerConfig={providerConfig} />
          </FormCard>
        )}
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} />
    </FormProvider>
  );
}

export default Connection;
