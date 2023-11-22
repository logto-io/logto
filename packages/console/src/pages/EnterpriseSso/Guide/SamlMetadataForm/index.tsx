import { type SsoProviderName } from '@logto/schemas';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import TextInput from '@/ds-components/TextInput';
import Textarea from '@/ds-components/Textarea';
import {
  type ParsedSsoIdentityProviderConfig,
  type SamlGuideFormType,
  type SsoConnectorConfig,
} from '@/pages/EnterpriseSso/types.js';

import ParsedConfigPreview from './ParsedConfigPreview';
import SwitchFormatButton, { FormFormat } from './SwitchFormatButton';
import * as styles from './index.module.scss';

type SamlMetadataFormFieldsProps = Pick<SamlMetadataFormProps, 'config'> & {
  identityProviderConfig?: ParsedSsoIdentityProviderConfig<SsoProviderName.SAML>['identityProvider'];
  formFormat: FormFormat;
  isFieldCheckRequired?: boolean;
};

type SamlMetadataFormProps = {
  config?: SsoConnectorConfig<SsoProviderName.SAML>;
  isGuidePage?: boolean;
  providerConfig?: ParsedSsoIdentityProviderConfig<SsoProviderName.SAML>;
};

function SamlMetadataFormFields({
  formFormat,
  isFieldCheckRequired,
  identityProviderConfig,
  config,
}: SamlMetadataFormFieldsProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    register,
    formState: { errors },
  } = useFormContext<SamlGuideFormType>();

  switch (formFormat) {
    case FormFormat.Manual: {
      return (
        <>
          <FormField
            isRequired={isFieldCheckRequired}
            title="enterprise_sso.metadata.saml.sign_in_endpoint_field_name"
          >
            <TextInput
              {...register('signInEndpoint', { required: isFieldCheckRequired })}
              error={Boolean(errors.signInEndpoint)}
            />
          </FormField>
          <FormField
            isRequired={isFieldCheckRequired}
            title="enterprise_sso.metadata.saml.idp_entity_id_field_name"
          >
            <TextInput
              {...register('entityId', { required: isFieldCheckRequired })}
              error={Boolean(errors.entityId)}
            />
          </FormField>
          <FormField
            isRequired={isFieldCheckRequired}
            title="enterprise_sso.metadata.saml.certificate_field_name"
          >
            <Textarea
              {...register('x509Certificate', { required: isFieldCheckRequired })}
              placeholder={t('enterprise_sso.metadata.saml.certificate_placeholder')}
              error={Boolean(errors.x509Certificate)}
            />
          </FormField>
        </>
      );
    }
    case FormFormat.Xml: {
      return (
        <>
          <FormField
            isRequired={isFieldCheckRequired}
            title="enterprise_sso.metadata.saml.metadata_xml_field_name"
          >
            <Textarea
              rows={5}
              {...register('metadata', { required: isFieldCheckRequired })}
              error={Boolean(errors.metadata)}
            />
          </FormField>
          {/* Since we will reset all other fields except for the current one when switching to another configuration form format, we only show parsed config preview when the result comes from the current form format. */}
          {/* `identityProviderConfig` is optional, directly pass to `ParsedConfigPreview` and leave the fallback inside the component to make the type definition not monkey-patched. */}
          {config?.metadata && (
            <ParsedConfigPreview identityProviderConfig={identityProviderConfig} />
          )}
        </>
      );
    }
    case FormFormat.Url: {
      return (
        <>
          <FormField
            isRequired={isFieldCheckRequired}
            title="enterprise_sso.metadata.saml.metadata_url_field_name"
          >
            <TextInput
              {...register('metadataUrl', {
                required: isFieldCheckRequired,
              })}
              error={Boolean(errors.metadataUrl)}
            />
            <div className={styles.description}>
              {t('enterprise_sso.metadata.saml.metadata_url_description')}
            </div>
          </FormField>
          {/* Since we will reset all other fields except for the current one when switching to another configuration form format, we only show parsed config preview when the result comes from the current form format. */}
          {/* `identityProviderConfig` is optional, directly pass to `ParsedConfigPreview` and leave the fallback inside the component to make the type definition not monkey-patched. */}
          {config?.metadataUrl && (
            <ParsedConfigPreview identityProviderConfig={identityProviderConfig} />
          )}
        </>
      );
    }
    default: {
      return null;
    }
  }
}

// Do not show inline notification and parsed config preview if it is on guide page.
function SamlMetadataForm({ config, isGuidePage, providerConfig }: SamlMetadataFormProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { setValue } = useFormContext<SamlGuideFormType>();
  const identityProviderConfig = providerConfig?.identityProvider;

  const isFieldCheckRequired = !isGuidePage;
  const isConfigEmpty = !config || Object.keys(config).length === 0;

  // Default form format could change based on the value of ORIGINAL `config`.
  // We emphasis ORIGINAL here to avoid using `watch()` which got the real-time value and could lead to conflict.
  const [formFormat, setFormFormat] = useState<FormFormat>(() => {
    if (!config) {
      return FormFormat.Url;
    }

    const { metadataUrl, metadata, entityId, signInEndpoint, x509Certificate } = config;
    if (metadataUrl) {
      return FormFormat.Url;
    }
    if (metadata) {
      return FormFormat.Xml;
    }
    if (entityId && signInEndpoint && x509Certificate) {
      return FormFormat.Manual;
    }
    return FormFormat.Url;
  });

  // If some form format is selected, then fields from other fields should be cleared.
  const onSelect = (newFormFormat: FormFormat) => {
    if (newFormFormat === formFormat) {
      return;
    }

    // Reset old format form values.
    switch (formFormat) {
      case FormFormat.Url: {
        setValue('metadataUrl', undefined);
        break;
      }
      case FormFormat.Xml: {
        setValue('metadata', undefined);
        break;
      }
      case FormFormat.Manual: {
        setValue('entityId', undefined);
        setValue('signInEndpoint', undefined);
        setValue('x509Certificate', undefined);
        break;
      }
      default: {
        break;
      }
    }

    // Resume field if exists in `config`; should show original value if switch to another form format and switch back.
    switch (newFormFormat) {
      case FormFormat.Url: {
        setValue('metadataUrl', config?.metadataUrl);
        break;
      }
      case FormFormat.Xml: {
        setValue('metadata', config?.metadata);
        break;
      }
      case FormFormat.Manual: {
        setValue('entityId', config?.entityId);
        setValue('signInEndpoint', config?.signInEndpoint);
        setValue('x509Certificate', config?.x509Certificate);
        break;
      }
      default: {
        break;
      }
    }

    setFormFormat(newFormFormat);
  };

  return (
    <>
      {!identityProviderConfig && isConfigEmpty && (
        <InlineNotification severity="alert">
          {t(
            formFormat === FormFormat.Url
              ? 'enterprise_sso_details.upload_saml_idp_metadata_info_text_url'
              : formFormat === FormFormat.Xml
              ? 'enterprise_sso_details.upload_saml_idp_metadata_info_text_xml'
              : 'enterprise_sso_details.upload_saml_idp_metadata_info_text_manual'
          )}
        </InlineNotification>
      )}
      <SamlMetadataFormFields
        formFormat={formFormat}
        isFieldCheckRequired={isFieldCheckRequired}
        identityProviderConfig={identityProviderConfig}
        config={config}
      />
      <SwitchFormatButton value={formFormat} onChange={onSelect} />
    </>
  );
}

export default SamlMetadataForm;
