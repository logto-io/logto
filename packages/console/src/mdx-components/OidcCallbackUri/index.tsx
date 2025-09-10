import { useContext } from 'react';

import { AppDataContext } from '@/contexts/AppDataProvider';
import { SsoConnectorContext } from '@/contexts/SsoConnectorContextProvider';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import useAvailableDomains from '@/hooks/use-available-domains';
import { applyDomain } from '@/utils/url';

import styles from './index.module.scss';

function OidcCallbackUri() {
  const { ssoConnector } = useContext(SsoConnectorContext);
  const { tenantEndpoint } = useContext(AppDataContext);
  const availableDomains = useAvailableDomains();

  if (!ssoConnector) {
    return null;
  }

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

export default OidcCallbackUri;
