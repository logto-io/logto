import { SsoProviderName, type SsoConnectorWithProviderConfig } from '@logto/schemas';
import { conditionalString } from '@silverhand/essentials';
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

  if (
    [SsoProviderName.OIDC, SsoProviderName.GOOGLE_WORKSPACE, SsoProviderName.OKTA].includes(
      providerName
    )
  ) {
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
   * Should not fallback to some other manually concatenated URL, show empty string instead.
   * Empty string should never show up unless the API does not work properly.
   */
  return (
    <>
      <FormField title="enterprise_sso.basic_info.saml.acs_url_field_name">
        <CopyToClipboard
          className={styles.copyToClipboard}
          variant="border"
          value={conditionalString(
            result.success &&
              result.data.serviceProvider.assertionConsumerServiceUrl &&
              applyCustomDomain(result.data.serviceProvider.assertionConsumerServiceUrl)
          )}
        />
      </FormField>
      <FormField title="enterprise_sso.basic_info.saml.audience_uri_field_name">
        <CopyToClipboard
          className={styles.copyToClipboard}
          variant="border"
          value={conditionalString(
            result.success &&
              result.data.serviceProvider.entityId &&
              applyCustomDomain(result.data.serviceProvider.entityId)
          )}
        />
      </FormField>
    </>
  );
}

export default BasicInfo;
