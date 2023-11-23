import { SsoProviderName, type SsoConnectorWithProviderConfig } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useContext } from 'react';
import { z } from 'zod';

import { AppDataContext } from '@/contexts/AppDataProvider';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import useCustomDomain from '@/hooks/use-custom-domain';

import * as styles from './index.module.scss';

type Props = {
  ssoConnectorId: string;
} & Pick<SsoConnectorWithProviderConfig, 'providerName' | 'providerConfig'>;

/**
 * TODO: Should align this with the guard `samlServiceProviderMetadataGuard` defined in {@link logto/core/src/sso/types/saml.ts}.
 * This only applies to SAML SSO connectors.
 */
const providerPropertiesGuard = z.object({
  serviceProvider: z.object({
    assertionConsumerServiceUrl: z.string().min(1),
    entityId: z.string().min(1),
  }),
});

function BasicInfo({ ssoConnectorId, providerName, providerConfig }: Props) {
  const { tenantEndpoint } = useContext(AppDataContext);
  const { applyDomain: applyCustomDomain } = useCustomDomain();

  if (providerName === SsoProviderName.OIDC) {
    return (
      <FormField title="enterprise_sso.basic_info.oidc.redirect_uri_field_name">
        {/* Generated and passed in by Admin console. */}
        <CopyToClipboard
          className={styles.copyToClipboard}
          variant="border"
          value={applyCustomDomain(
            new URL(`/callback/${ssoConnectorId}`, tenantEndpoint).toString()
          )}
        />
      </FormField>
    );
  }

  const result = providerPropertiesGuard.safeParse(providerConfig);

  /**
   * Used fallback to show the default value anyways but the cases should not happen.
   * TODO: @darcyYe refactor to remove the manual guard.
   */
  return (
    <>
      <FormField title="enterprise_sso.basic_info.saml.acs_url_field_name">
        <CopyToClipboard
          className={styles.copyToClipboard}
          variant="border"
          value={applyCustomDomain(
            conditional(
              result.success && result.data.serviceProvider.assertionConsumerServiceUrl
            ) ?? new URL(`/api/authn/saml/sso/${ssoConnectorId}`, tenantEndpoint).toString()
          )}
        />
      </FormField>
      <FormField title="enterprise_sso.basic_info.saml.audience_uri_field_name">
        <CopyToClipboard
          className={styles.copyToClipboard}
          variant="border"
          value={applyCustomDomain(
            conditional(result.success && result.data.serviceProvider.entityId) ??
              new URL(`/api/sso-connector/${ssoConnectorId}`, tenantEndpoint).toString()
          )}
        />
      </FormField>
    </>
  );
}

export default BasicInfo;
