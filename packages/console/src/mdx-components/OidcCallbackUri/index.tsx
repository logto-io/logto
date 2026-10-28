import { type SsoConnectorWithProviderConfig } from '@logto/schemas';
import { useContext } from 'react';

import { type ConsoleSsoConnector } from '@/cloud/types/router';
import { AppDataContext } from '@/contexts/AppDataProvider';
import { SsoConnectorContext } from '@/contexts/SsoConnectorContextProvider';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import useAvailableDomains from '@/hooks/use-available-domains';
import { applyDomain } from '@/utils/url';

import styles from './index.module.scss';

function TenantOidcCallbackUri({
  ssoConnector,
}: {
  readonly ssoConnector: SsoConnectorWithProviderConfig;
}) {
  const { tenantEndpoint } = useContext(AppDataContext);
  const availableDomains = useAvailableDomains();

  const { id } = ssoConnector;

  return (
    <FormField
      title="enterprise_sso.basic_info.oidc.redirect_uri_field_name"
      className={styles.inputField}
    >
      <div className={styles.uriList}>
        {availableDomains.map((domain) => (
          <CopyToClipboard
            key={domain}
            displayType="block"
            variant="border"
            value={applyDomain(new URL(`/callback/${id}`, tenantEndpoint).toString(), domain)}
          />
        ))}
      </div>
    </FormField>
  );
}

/** Console SSO connectors use the fixed redirect URI provided by Logto Cloud. */
function ConsoleSsoOidcCallbackUri({
  consoleSsoConnector,
}: {
  readonly consoleSsoConnector: ConsoleSsoConnector;
}) {
  return (
    <FormField
      title="enterprise_sso.basic_info.oidc.redirect_uri_field_name"
      className={styles.inputField}
    >
      {consoleSsoConnector.redirectUri && (
        <CopyToClipboard
          displayType="block"
          variant="border"
          value={consoleSsoConnector.redirectUri}
        />
      )}
    </FormField>
  );
}

function OidcCallbackUri() {
  const { ssoConnector, consoleSsoConnector } = useContext(SsoConnectorContext);

  if (consoleSsoConnector) {
    return <ConsoleSsoOidcCallbackUri consoleSsoConnector={consoleSsoConnector} />;
  }

  if (!ssoConnector) {
    return null;
  }

  return <TenantOidcCallbackUri ssoConnector={ssoConnector} />;
}

export default OidcCallbackUri;
