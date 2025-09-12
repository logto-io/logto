import { useContext } from 'react';

import { AppDataContext } from '@/contexts/AppDataProvider';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import useAvailableDomains from '@/hooks/use-available-domains';
import { applyDomain } from '@/utils/url';

import styles from './ConnectorSpInfo.module.scss';

type Props = {
  readonly ssoConnectorId: string;
};

function OidcConnectorSpInfo({ ssoConnectorId }: Props) {
  const { tenantEndpoint } = useContext(AppDataContext);
  const availableDomains = useAvailableDomains();

  return (
    <FormField title="enterprise_sso.basic_info.oidc.redirect_uri_field_name">
      {/* Generated and passed in by Admin console. */}
      <div className={styles.uriContent}>
        {availableDomains.map((domain) => (
          <CopyToClipboard
            key={domain}
            displayType="block"
            variant="border"
            value={applyDomain(
              new URL(`/callback/${ssoConnectorId}`, tenantEndpoint).toString(),
              domain
            )}
          />
        ))}
      </div>
    </FormField>
  );
}

export default OidcConnectorSpInfo;
