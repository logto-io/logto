import { type ApplicationResponse, type SnakeCaseOidcConfig } from '@logto/schemas';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import DetailsPage from '@/components/DetailsPage';
import PageMeta from '@/components/PageMeta';
import { openIdProviderConfigPath } from '@/consts/oidc';
import type { RequestError } from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import ApplicationDetailsContent from './ApplicationDetailsContent';
import GuideModal from './GuideModal';

function ApplicationDetails() {
  const { id, guideId } = useParams();
  const { navigate, match } = useTenantPathname();
  const isGuideView = !!id && !!guideId && match(`/applications/${id}/guide/${guideId}`);

  const { data, error, mutate } = useSWR<ApplicationResponse, RequestError>(
    id && `api/applications/${id}`
  );

  const {
    data: oidcConfig,
    error: fetchOidcConfigError,
    mutate: mutateOidcConfig,
  } = useSWR<SnakeCaseOidcConfig, RequestError>(openIdProviderConfigPath);

  const isLoading = (!data && !error) || (!oidcConfig && !fetchOidcConfigError);
  const requestError = error ?? fetchOidcConfigError;

  if (isGuideView) {
    return (
      <GuideModal
        guideId={guideId}
        app={data}
        onClose={() => {
          navigate(`/applications/${id}`);
        }}
      />
    );
  }

  return (
    <DetailsPage
      backLink={data?.isThirdParty ? '/applications/third-party-applications' : '/applications'}
      backLinkTitle="application_details.back_to_applications"
      isLoading={isLoading}
      error={requestError}
      onRetry={() => {
        void mutate();
        void mutateOidcConfig();
      }}
    >
      <PageMeta titleKey="application_details.page_title" />
      {data && oidcConfig && (
        <ApplicationDetailsContent
          data={data}
          oidcConfig={oidcConfig}
          onApplicationUpdated={mutate}
        />
      )}
    </DetailsPage>
  );
}

export default ApplicationDetails;
