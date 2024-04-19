import { useContext } from 'react';

import { AppDataContext } from '@/contexts/AppDataProvider';
import { SsoConnectorContext } from '@/contexts/SsoConnectorContextProvider';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import useCustomDomain from '@/hooks/use-custom-domain';

import * as styles from './index.module.scss';

function OidcCallbackUri() {
  const { ssoConnector } = useContext(SsoConnectorContext);
  const { tenantEndpoint } = useContext(AppDataContext);
  const { applyDomain: applyCustomDomain } = useCustomDomain();

  if (!ssoConnector) {
    return null;
  }

  const { id } = ssoConnector;

  return (
    <FormField
      title="enterprise_sso.basic_info.oidc.redirect_uri_field_name"
      className={styles.inputField}
    >
      <CopyToClipboard
        displayType="block"
        variant="border"
        value={applyCustomDomain(new URL(`/callback/${id}`, tenantEndpoint).toString())}
      />
    </FormField>
  );
}

export default OidcCallbackUri;
