import { type Application, type SsoConnectorWithProviderConfig } from '@logto/schemas';
import { useContext, useMemo } from 'react';
import useSWR from 'swr';

import FormCard, { FormCardSkeleton } from '@/components/FormCard';
import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { type RequestError } from '@/hooks/use-api';

import { shouldShowIdpInitiatedAuthUpsell } from '../utils';

import ConfigForm from './ConfigForm';
import OssUpsell from './OssUpsell';
import useIdpInitiatedAuthConfigSWR from './use-idp-initiated-auth-config-swr';
import { applicationsSearchUrl } from './utils';

type Props = {
  readonly ssoConnector: SsoConnectorWithProviderConfig;
};

function IdpInitiatedAuth({ ssoConnector }: Props) {
  const { currentSubscriptionQuota } = useContext(SubscriptionDataContext);
  const shouldShowOssUpsell = shouldShowIdpInitiatedAuthUpsell({
    isCloud,
    isIdpInitiatedSsoEnabled: currentSubscriptionQuota.idpInitiatedSsoEnabled,
  });

  const { data: applications, error: applicationError } = useSWR<Application[], RequestError>(
    shouldShowOssUpsell ? undefined : applicationsSearchUrl
  );

  const {
    data: idpInitiatedAuthConfig,
    mutate,
    error: idpInitiatedAuthConfigError,
  } = useIdpInitiatedAuthConfigSWR(shouldShowOssUpsell ? undefined : ssoConnector.id);

  const isLoading = useMemo(
    () =>
      (!applications && !applicationError) ||
      (!idpInitiatedAuthConfig && !idpInitiatedAuthConfigError),
    [applicationError, applications, idpInitiatedAuthConfig, idpInitiatedAuthConfigError]
  );

  const filteredApplications = useMemo(
    () => applications?.filter(({ isThirdParty }) => !isThirdParty),
    [applications]
  );

  if (shouldShowOssUpsell) {
    return <OssUpsell />;
  }

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
      applications={filteredApplications ?? []}
      idpInitiatedAuthConfig={idpInitiatedAuthConfig}
      mutateIdpInitiatedConfig={mutate}
    />
  );
}

export default IdpInitiatedAuth;
