import { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import TextInput from '@/ds-components/TextInput';
import {
  type SamlConnectorConfig,
  type SamlProviderConfig,
} from '@/pages/EnterpriseSsoDetails/types/saml';
import { uriValidator } from '@/utils/validator';

import FileReader, { type Props as FileReaderProps } from '../FileReader';

import ParsedConfigPreview, { CertificatePreview } from './ParsedConfigPreview';
import SwitchFormatButton, { FormFormat } from './SwitchFormatButton';
import * as styles from './index.module.scss';

type SamlMetadataFormFieldsProps = Pick<SamlMetadataFormProps, 'config'> & {
  readonly identityProviderConfig?: SamlProviderConfig['identityProvider'];
  readonly formFormat: FormFormat;
};

type FileValueKeyType = keyof Pick<SamlConnectorConfig, 'metadata' | 'x509Certificate'>; // I.e. 'metadata' | 'x509Certificate'.

const fileReaderAttributesMap: Record<FileValueKeyType, FileReaderProps['attributes']> = {
  // Accept xml file.
  metadata: {
    buttonTitle: 'enterprise_sso.metadata.saml.metadata_xml_uploader_text',
    accept: {
      'application/xml': [],
      'text/xml': [],
    },
    defaultFilename: 'identity provider metadata.xml',
    defaultFileMimeType: 'application/xml',
  },
  x509Certificate: {
    buttonTitle: 'enterprise_sso_details.upload_signing_certificate_button_text',
    accept: {
      'application/x-x509-user-cert': ['.crt', '.cer'],
      'application/x-x509-ca-cert': ['.crt', '.cer'],
      'application/x-pem-file': ['.pem'],
    },
    defaultFilename: 'signing certificate.cer',
    defaultFileMimeType: 'application/x-x509-user-cert',
  },
};

function SamlMetadataFormFields({
  formFormat,
  identityProviderConfig,
  config,
}: SamlMetadataFormFieldsProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const {
    setError,
    control,
    register,
    formState: { errors },
  } = useFormContext<SamlConnectorConfig>();

  switch (formFormat) {
    case FormFormat.Manual: {
      return (
        <>
          <FormField isRequired title="enterprise_sso.metadata.saml.sign_in_endpoint_field_name">
            <TextInput
              {...register('signInEndpoint', {
                required: true,
                validate: (value) =>
                  !value || uriValidator(value) || t('errors.invalid_uri_format'),
              })}
              error={Boolean(errors.signInEndpoint)}
              placeholder="https://"
            />
          </FormField>
          <FormField isRequired title="enterprise_sso.metadata.saml.idp_entity_id_field_name">
            <TextInput
              {...register('entityId', {
                required: true,
                validate: (value) =>
                  !value || uriValidator(value) || t('errors.invalid_uri_format'),
              })}
              error={Boolean(errors.entityId)}
              placeholder="https://"
            />
          </FormField>
          <FormField isRequired title="enterprise_sso.metadata.saml.certificate_field_name">
            <Controller
              control={control}
              name="x509Certificate"
              rules={{
                validate: (value) => {
                  if (!value) {
                    return t('enterprise_sso.metadata.saml.certificate_required');
                  }
                  return true;
                },
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  <FileReader
                    attributes={fileReaderAttributesMap.x509Certificate}
                    value={value}
                    fieldError={errors.x509Certificate}
                    setError={(error) => {
                      setError('x509Certificate', error);
                    }}
                    onChange={onChange}
                  />
                  {value && identityProviderConfig && (
                    <CertificatePreview
                      className={styles.certificatePreview}
                      identityProviderConfig={identityProviderConfig}
                    />
                  )}
                </>
              )}
            />
          </FormField>
        </>
      );
    }
    case FormFormat.Xml: {
      return (
        <>
          <FormField title="enterprise_sso.metadata.saml.metadata_xml_field_name">
            <Controller
              control={control}
              name="metadata"
              render={({ field: { onChange, value } }) => (
                <FileReader
                  attributes={fileReaderAttributesMap.metadata}
                  value={value}
                  fieldError={errors.metadata}
                  setError={(error) => {
                    setError('metadata', error);
                  }}
                  onChange={onChange}
                />
              )}
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
          <FormField isRequired title="enterprise_sso.metadata.saml.metadata_url_field_name">
            <TextInput
              {...register('metadataUrl', {
                required: true,
                validate: (value) =>
                  !value || uriValidator(value) || t('errors.invalid_uri_format'),
              })}
              error={errors.metadataUrl?.message}
              placeholder="https://"
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
  }
}

type SamlMetadataFormProps = {
  readonly config?: SamlConnectorConfig;
  readonly providerConfig?: SamlProviderConfig;
};

// Do not show inline notification and parsed config preview if it is on guide page.
function SamlMetadataForm({ config, providerConfig }: SamlMetadataFormProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { setValue } = useFormContext<SamlConnectorConfig>();
  const identityProviderConfig = providerConfig?.identityProvider;

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
        identityProviderConfig={identityProviderConfig}
        config={config}
      />
      <SwitchFormatButton value={formFormat} onChange={onSelect} />
    </>
  );
}

export default SamlMetadataForm;
