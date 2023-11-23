import { SsoProviderName } from '@logto/schemas';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import TextInput from '@/ds-components/TextInput';
import {
  type ParsedSsoIdentityProviderConfig,
  type OidcGuideFormType,
  type SsoConnectorConfig,
} from '@/pages/EnterpriseSso/types.js';

import ParsedConfigPreview from './ParsedConfigPreview';
import * as styles from './index.module.scss';

type Props = {
  isGuidePage?: boolean;
  providerConfig?: ParsedSsoIdentityProviderConfig<SsoProviderName.OIDC>;
  config?: SsoConnectorConfig<SsoProviderName.OIDC>;
  ssoProviderName: SsoProviderName;
};

// Do not show inline notification and parsed config preview if it is on guide page.
function OidcMetadataForm({ isGuidePage, providerConfig, config, ssoProviderName }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    register,
    formState: { errors },
  } = useFormContext<OidcGuideFormType>();

  const isFieldCheckRequired = !isGuidePage;
  const isConfigEmpty = !config || Object.keys(config).length === 0;

  return (
    <>
      {isFieldCheckRequired && !providerConfig && isConfigEmpty && (
        <InlineNotification severity="alert">
          {t('enterprise_sso_details.upload_oidc_idp_info_text')}
        </InlineNotification>
      )}
      <FormField
        isRequired={isFieldCheckRequired}
        title="enterprise_sso.metadata.oidc.client_id_field_name"
      >
        <TextInput
          {...register('clientId', { required: isFieldCheckRequired })}
          error={Boolean(errors.clientId)}
        />
      </FormField>
      <FormField
        isRequired={isFieldCheckRequired}
        title="enterprise_sso.metadata.oidc.client_secret_field_name"
      >
        <TextInput
          {...register('clientSecret', { required: isFieldCheckRequired })}
          error={Boolean(errors.clientSecret)}
        />
      </FormField>
      <FormField
        isRequired={isFieldCheckRequired && ssoProviderName !== SsoProviderName.GOOGLE_WORKSPACE}
        title="enterprise_sso.metadata.oidc.issuer_field_name"
      >
        {ssoProviderName === SsoProviderName.GOOGLE_WORKSPACE ? (
          <CopyToClipboard
            className={styles.copyToClipboard}
            variant="border"
            // TODO: this hard-coded value should align with the `googleIssuer` value defined in `packages/core/src/sso/GoogleWorkspaceSsoConnector/index.ts`.
            value={providerConfig?.issuer ?? 'https://accounts.google.com'}
          />
        ) : (
          <TextInput
            {...register('issuer', { required: isFieldCheckRequired })}
            error={Boolean(errors.issuer)}
          />
        )}
        {isFieldCheckRequired &&
          providerConfig &&
          (config?.issuer ?? ssoProviderName === SsoProviderName.GOOGLE_WORKSPACE) && (
            <ParsedConfigPreview
              className={styles.oidcConfigPreview}
              providerConfig={providerConfig}
            />
          )}
      </FormField>
      <FormField title="enterprise_sso.metadata.oidc.scope_field_name">
        <TextInput {...register('scope')} error={Boolean(errors.scope)} />
      </FormField>
    </>
  );
}

export default OidcMetadataForm;
