import { useContext } from 'react';

import { AppDataContext } from '@/contexts/AppDataProvider';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import useCustomDomain from '@/hooks/use-custom-domain';

type Props = {
  readonly ssoConnectorId: string;
};

function OidcConnectorSpInfo({ ssoConnectorId }: Props) {
  const { tenantEndpoint } = useContext(AppDataContext);
  const { applyDomain: applyCustomDomain } = useCustomDomain();

  return (
    <FormField title="enterprise_sso.basic_info.oidc.redirect_uri_field_name">
      {/* Generated and passed in by Admin console. */}
      <CopyToClipboard
        displayType="block"
        variant="border"
        value={applyCustomDomain(new URL(`/callback/${ssoConnectorId}`, tenantEndpoint).toString())}
      />
    </FormField>
  );
}

export default OidcConnectorSpInfo;
