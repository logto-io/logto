import { SsoProviderName, type RequestErrorBody } from '@logto/schemas';
import { conditional, type Optional } from '@silverhand/essentials';
import cleanDeep from 'clean-deep';
import { HTTPError } from 'ky';
import { useForm, FormProvider, type Path, type DeepPartial } from 'react-hook-form';
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
  type SamlGuideFormType,
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

const invalidConfigErrorCode = 'connector.invalid_config';
const invalidMetadataErrorCode = 'connector.invalid_metadata';

// This component contains only `data.config`.
function Connection<T extends SsoProviderName>({ isDeleted, data, onUpdated }: Props<T>) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { id: ssoConnectorId, providerName, providerConfig, config } = data;

  const api = useApi({ hideErrorToast: true });

  const methods = useForm<GuideFormType<T>>({
    // Make typescript happy
    // eslint-disable-next-line no-restricted-syntax
    defaultValues: config as DeepPartial<GuideFormType<T>>,
  });

  const {
    watch,
    setError,
    formState: { isSubmitting, isDirty },
    handleSubmit,
    reset,
  } = methods;

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      if (isSubmitting) {
        return;
      }

      try {
        const updatedSsoConnector = await api
          // TODO: @darcyYe add console test case to remove attribute mapping config.
          .patch(`api/sso-connectors/${ssoConnectorId}`, {
            json: { config: cleanDeep(formData) },
          })
          .json<SsoConnectorWithProviderConfigWithGeneric<T>>();

        toast.success(t('general.saved'));
        onUpdated(updatedSsoConnector);

        reset(updatedSsoConnector.config);
      } catch (error: unknown) {
        if (error instanceof HTTPError) {
          const { response } = error;
          const metadata = await response.clone().json<RequestErrorBody>();

          // TODO: @darcyYe refactor the generic of `GuideFormType<T>`.
          // Typescript can not infer the generic `GuideFormType<T>`, find a better way to deal with the types later.

          if (metadata.code === invalidConfigErrorCode) {
            // OIDC-based SSO connector's config only relies on the result of read from `issuer` field.
            if (
              [
                SsoProviderName.OIDC,
                SsoProviderName.GOOGLE_WORKSPACE,
                SsoProviderName.OKTA,
              ].includes(providerName)
            ) {
              // eslint-disable-next-line no-restricted-syntax
              setError('issuer' as Path<GuideFormType<T>>, {
                type: 'custom',
                message: metadata.message,
              });
            }

            // OIDC-based config has been excluded in previous condition check.
            // eslint-disable-next-line no-restricted-syntax
            const formConfig = watch() as SamlGuideFormType;
            const key =
              conditional(formConfig.metadata && 'metadata') ??
              conditional(formConfig.metadataUrl && 'metadataUrl');
            if (key) {
              // eslint-disable-next-line no-restricted-syntax
              setError(key as Path<GuideFormType<T>>, {
                type: 'custom',
                message: metadata.message,
              });
            }
          }

          // Invalid metadata error only happens for SAML based SSO connectors, when trying to init IdP with XML-format metadata.
          if (
            metadata.code === invalidMetadataErrorCode &&
            [SsoProviderName.SAML, SsoProviderName.AZURE_AD].includes(providerName)
          ) {
            // Typescript can not infer the generic of setError() path.
            // eslint-disable-next-line no-restricted-syntax
            const formConfig = watch() as SamlGuideFormType;
            const key =
              conditional(formConfig.metadata && 'metadata') ??
              conditional(formConfig.metadataUrl && 'metadataUrl');
            // eslint-disable-next-line no-restricted-syntax
            setError(key as Path<GuideFormType<T>>, { type: 'custom', message: metadata.message });
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
