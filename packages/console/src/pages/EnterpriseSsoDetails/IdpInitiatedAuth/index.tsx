import { type Application, type SsoConnectorWithProviderConfig } from '@logto/schemas';
import { useMemo } from 'react';
import useSWR from 'swr';

import FormCard, { FormCardSkeleton } from '@/components/FormCard';
import { type RequestError } from '@/hooks/use-api';

import ConfigForm from './ConfigForm';
import useIdpInitiatedAuthConfigSWR from './use-idp-initiated-auth-config-swr';
import { applicationsSearchUrl } from './utils';

type Props = {
  readonly ssoConnector: SsoConnectorWithProviderConfig;
};

function IdpInitiatedAuth({ ssoConnector }: Props) {
  const { data: applications, error: applicationError } = useSWR<Application[], RequestError>(
    applicationsSearchUrl
  );

  const {
    data: idpInitiatedAuthConfig,
    mutate,
    error: idpInitiatedAuthConfigError,
  } = useIdpInitiatedAuthConfigSWR(ssoConnector.id);

  const isLoading = useMemo(
    () =>
      (!applications && !applicationError) ||
      (!idpInitiatedAuthConfig && !idpInitiatedAuthConfigError),
    [applicationError, applications, idpInitiatedAuthConfig, idpInitiatedAuthConfigError]
  );

  if (isLoading) {
    return (
      <FormCard
        title="enterprise_sso_details.idp_initiated_auth_config.card_title"
        description="enterprise_sso_details.idp_initiated_auth_config.card_description"
      >
        <FormCardSkeleton />
      </FormCard>
    );
  }

  return (
    <ConfigForm
      ssoConnector={ssoConnector}
      applications={applications ?? []}
      idpInitiatedAuthConfig={idpInitiatedAuthConfig}
      mutateIdpInitiatedConfig={mutate}
    />
  );
}

export default IdpInitiatedAuth;
