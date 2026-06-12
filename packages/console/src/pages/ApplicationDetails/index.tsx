import { type ApplicationResponse, type SnakeCaseOidcConfig } from '@logto/schemas';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import DetailsPage from '@/components/DetailsPage';
import PageMeta from '@/components/PageMeta';
import { openIdProviderConfigPath } from '@/consts/oidc';
import { Daisy } from '@/ds-components/Spinner';
import type { RequestError } from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import ApplicationDetailsContent from './ApplicationDetailsContent';
import { type ApplicationSecretRow } from './ApplicationDetailsContent/EndpointsAndCredentials';
import GuideModal from './GuideModal';
import SamlApplicationDetailsContent, { isSamlApplication } from './SamlApplicationDetailsContent';

function ApplicationDetails() {
  const { id, guideId } = useParams();
  const { navigate, match } = useTenantPathname();
  const isGuideView = !!id && !!guideId && match(`/applications/${id}/guide/${guideId}`);

  const { data, error, mutate } = useSWR<ApplicationResponse, RequestError>(
    id && `api/applications/${id}`
  );
  const secrets = useSWR<ApplicationSecretRow[], RequestError>(`api/applications/${id}/secrets`);
  const oidcConfig = useSWR<SnakeCaseOidcConfig, RequestError>(openIdProviderConfigPath);

  const handleApplicationUpdated = useCallback(
    async (application?: ApplicationResponse) => {
      if (application) {
        await mutate(application, { revalidate: false });
        return;
      }

      await mutate();
    },
    [mutate]
  );

  const isLoading =
    (!data && !error) ||
    (!oidcConfig.data && !oidcConfig.error) ||
    (!secrets.data && !secrets.error);
  const requestError = error ?? oidcConfig.error ?? secrets.error;

  if (isGuideView) {
    if (!data || !secrets.data) {
      return <Daisy />;
    }

    return (
      <GuideModal
        guideId={guideId}
        app={data}
        secrets={secrets.data}
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
        void oidcConfig.mutate();
        void secrets.mutate();
      }}
    >
      <PageMeta titleKey="application_details.page_title" />
      {data &&
        oidcConfig.data &&
        secrets.data &&
        (isSamlApplication(data) ? (
          <SamlApplicationDetailsContent
            data={data}
            onApplicationUpdated={handleApplicationUpdated}
          />
        ) : (
          <ApplicationDetailsContent
            data={data}
            oidcConfig={oidcConfig.data}
            secrets={secrets.data}
            onApplicationUpdated={handleApplicationUpdated}
          />
        ))}
    </DetailsPage>
  );
}

export default ApplicationDetails;
