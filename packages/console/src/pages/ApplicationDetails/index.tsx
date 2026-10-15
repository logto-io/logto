import { type ApplicationResponse, type SnakeCaseOidcConfig } from '@logto/schemas';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import DetailsPage from '@/components/DetailsPage';
import PageMeta from '@/components/PageMeta';
import { openIdProviderConfigPath } from '@/consts/oidc';
import { Daisy } from '@/ds-components/Spinner';
import type { RequestError } from '@/hooks/use-api';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import ApplicationDetailsContent from './ApplicationDetailsContent';
import { type ApplicationSecretRow } from './ApplicationDetailsContent/EndpointsAndCredentials';
import GuideModal from './GuideModal';
import SamlApplicationDetailsContent, { isSamlApplication } from './SamlApplicationDetailsContent';

// Guides put the first secret into their code samples, some through `btoa`, so a read-only member's
// guides get an ASCII placeholder for the withheld secrets.
const withheldSecrets: ApplicationSecretRow[] = [
  { name: 'withheld', value: '<hidden for viewers>', expiresAt: null },
];

function ApplicationDetails() {
  const { id, guideId } = useParams();
  const { navigate, match } = useTenantPathname();
  const isGuideView = !!id && !!guideId && match(`/applications/${id}/guide/${guideId}`);

  const { data, error, mutate } = useSWR<ApplicationResponse, RequestError>(
    id && `api/applications/${id}`
  );
  const {
    access: { isReadOnly, canReadCredentials },
  } = useCurrentTenantScopes();
  const secrets = useSWR<ApplicationSecretRow[], RequestError>(
    canReadCredentials && `api/applications/${id}/secrets`
  );
  // Both flags are false until the scopes load, so the page waits for them.
  const secretRows = isReadOnly ? withheldSecrets : secrets.data;
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
    (!data && !error) || (!oidcConfig.data && !oidcConfig.error) || (!secretRows && !secrets.error);
  const requestError = error ?? oidcConfig.error ?? secrets.error;

  if (isGuideView) {
    if (!data || !secretRows) {
      return <Daisy />;
    }

    return (
      <GuideModal
        guideId={guideId}
        app={data}
        secrets={secretRows}
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
        secretRows &&
        (isSamlApplication(data) ? (
          <SamlApplicationDetailsContent
            data={data}
            onApplicationUpdated={handleApplicationUpdated}
          />
        ) : (
          <ApplicationDetailsContent
            data={data}
            oidcConfig={oidcConfig.data}
            secrets={secretRows}
            onApplicationUpdated={handleApplicationUpdated}
          />
        ))}
    </DetailsPage>
  );
}

export default ApplicationDetails;
