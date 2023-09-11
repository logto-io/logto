import { DomainStatus, type ApplicationResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useContext, useMemo } from 'react';

import guides from '@/assets/docs/guides';
import Guide, { GuideContext, type GuideContextType } from '@/components/Guide';
import { AppDataContext } from '@/contexts/AppDataProvider';
import useCustomDomain from '@/hooks/use-custom-domain';

type Props = {
  className?: string;
  guideId: string;
  app?: ApplicationResponse;
  isCompact?: boolean;
  onClose: () => void;
};

function AppGuide({ className, guideId, app, isCompact, onClose }: Props) {
  const { tenantEndpoint } = useContext(AppDataContext);
  const { data: customDomain } = useCustomDomain();
  const isCustomDomainActive = customDomain?.status === DomainStatus.Active;
  const guide = guides.find(({ id }) => id === guideId);

  const GuideComponent = guide?.Component;

  const memorizedContext = useMemo(
    () =>
      conditional(
        !!guide &&
          !!app && {
            metadata: guide.metadata,
            Logo: guide.Logo,
            app,
            endpoint: tenantEndpoint?.toString() ?? '',
            alternativeEndpoint: conditional(isCustomDomainActive && tenantEndpoint?.toString()),
            redirectUris: app.oidcClientMetadata.redirectUris,
            postLogoutRedirectUris: app.oidcClientMetadata.postLogoutRedirectUris,
            isCompact: Boolean(isCompact),
            sampleUrls: {
              origin: 'http://localhost:3001/',
              callback: 'http://localhost:3001/callback',
            },
          }
      ) satisfies GuideContextType | undefined,
    [guide, app, tenantEndpoint, isCustomDomainActive, isCompact]
  );

  return memorizedContext ? (
    <GuideContext.Provider value={memorizedContext}>
      <Guide
        className={className}
        guideId={guideId}
        isEmpty={!app && !guide}
        isLoading={!app}
        onClose={onClose}
      />
    </GuideContext.Provider>
  ) : null;
}

export default AppGuide;
