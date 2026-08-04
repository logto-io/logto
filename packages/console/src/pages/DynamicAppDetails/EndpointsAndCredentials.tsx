import { type SnakeCaseOidcConfig } from '@logto/schemas';

import FormCard from '@/components/FormCard';
import OidcEndpoints from '@/components/OidcEndpoints';

type Props = {
  readonly oidcConfig: SnakeCaseOidcConfig;
};

/**
 * The OIDC endpoints a CIMD client integrates with. There is no app id or secret to show: each
 * client brings its own client id.
 */
function EndpointsAndCredentials({ oidcConfig }: Props) {
  return (
    <FormCard
      title="application_details.endpoints_and_credentials"
      description="application_details.endpoints_and_credentials_description"
      learnMoreLink={{
        href: 'https://openid.net/specs/openid-connect-core-1_0.html#TokenEndpoint',
        targetBlank: true,
      }}
    >
      {/* The Logto endpoint is for the Logto SDKs, it is hidden here for the same reason as
          third-party applications: a CIMD client integrates over plain OIDC. */}
      <OidcEndpoints oidcConfig={oidcConfig} />
    </FormCard>
  );
}

export default EndpointsAndCredentials;
