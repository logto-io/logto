import { SsoProviderName } from '@logto/schemas';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import Switch from '@/ds-components/Switch';
import TextInput from '@/ds-components/TextInput';
import Textarea from '@/ds-components/Textarea';
import { formatMultiLineScopeInput } from '@/utils/connector-form';
import { uriValidator } from '@/utils/validator';

import { type OidcConnectorConfig, type OidcProviderConfig } from '../../types/oidc';

import ParsedConfigPreview from './ParsedConfigPreview';
import styles from './index.module.scss';

type Props = {
  readonly providerConfig?: OidcProviderConfig;
  readonly config?: OidcConnectorConfig;
  readonly providerName: SsoProviderName;
};

// Do not show inline notification and parsed config preview if it is on guide page.
function OidcMetadataForm({ providerConfig, config, providerName }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    register,
    formState: { errors },
  } = useFormContext<OidcConnectorConfig>();

  const isConfigEmpty = !config || Object.keys(config).length === 0;

  return (
    <>
      {!providerConfig && isConfigEmpty && (
        <InlineNotification severity="alert">
          {t('enterprise_sso_details.upload_oidc_idp_info_text')}
        </InlineNotification>
      )}
      <FormField isRequired title="enterprise_sso.metadata.oidc.client_id_field_name">
        <TextInput
          {...register('clientId', { required: true })}
          error={Boolean(errors.clientId)}
          placeholder="Client ID"
        />
      </FormField>
      <FormField isRequired title="enterprise_sso.metadata.oidc.client_secret_field_name">
        <TextInput
          isConfidential
          {...register('clientSecret', { required: true })}
          error={Boolean(errors.clientSecret)}
          placeholder="Client secret"
        />
      </FormField>
      <FormField
        isRequired={providerName !== SsoProviderName.GOOGLE_WORKSPACE}
        title="enterprise_sso.metadata.oidc.issuer_field_name"
      >
        {providerName === SsoProviderName.GOOGLE_WORKSPACE ? (
          <CopyToClipboard
            displayType="block"
            variant="border"
            // TODO: this hard-coded value should align with the `googleIssuer` value defined in `packages/core/src/sso/GoogleWorkspaceSsoConnector/index.ts`.
            value={providerConfig?.issuer ?? 'https://accounts.google.com'}
          />
        ) : (
          <TextInput
            {...register('issuer', {
              required: true,
              validate: (value) => !value || uriValidator(value) || t('errors.invalid_uri_format'),
            })}
            error={errors.issuer?.message}
            placeholder="http(s)://"
          />
        )}
        {providerConfig &&
          (config?.issuer ?? providerName === SsoProviderName.GOOGLE_WORKSPACE) && (
            <ParsedConfigPreview
              className={styles.oidcConfigPreview}
              providerConfig={providerConfig}
            />
          )}
      </FormField>
      <FormField title="enterprise_sso.metadata.oidc.scope_field_name">
        <Textarea
          rows={5}
          {...register('scope', {
            setValueAs: (value) => formatMultiLineScopeInput(String(value)),
          })}
          error={Boolean(errors.scope)}
          placeholder={t('enterprise_sso.metadata.oidc.scope_field_placeholder')}
        />
      </FormField>
      {providerName === SsoProviderName.AZURE_AD_OIDC && (
        <FormField
          title="enterprise_sso_details.trust_unverified_email"
          tip={t('enterprise_sso_details.trust_unverified_email_tip')}
        >
          <Switch
            label={t('enterprise_sso_details.trust_unverified_email_label')}
            {...register('trustUnverifiedEmail')}
          />
        </FormField>
      )}
      {providerName === SsoProviderName.GOOGLE_WORKSPACE && (
        <FormField title="enterprise_sso_details.offline_access.label">
          <Switch
            label={t('enterprise_sso_details.offline_access.description')}
            {...register('offlineAccess')}
          />
        </FormField>
      )}
    </>
  );
}

export default OidcMetadataForm;
