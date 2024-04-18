import { type ApplicationResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useContext, useMemo } from 'react';

import guides from '@/assets/docs/guides';
import Guide, { GuideContext, type GuideContextType } from '@/components/Guide';
import { AppDataContext } from '@/contexts/AppDataProvider';
import useCustomDomain from '@/hooks/use-custom-domain';

type Props = {
  readonly className?: string;
  readonly guideId: string;
  readonly app?: ApplicationResponse;
  readonly isCompact?: boolean;
  readonly onClose: () => void;
};

function AppGuide({ className, guideId, app, isCompact, onClose }: Props) {
  const { tenantEndpoint } = useContext(AppDataContext);
  const { applyDomain: applyCustomDomain } = useCustomDomain();
  const guide = guides.find(({ id }) => id === guideId);

  const memorizedContext = useMemo(
    () =>
      conditional(
        !!guide &&
          !!app && {
            metadata: guide.metadata,
            Logo: guide.Logo,
            app,
            endpoint: applyCustomDomain(tenantEndpoint?.href ?? ''),
            redirectUris: app.oidcClientMetadata.redirectUris,
            postLogoutRedirectUris: app.oidcClientMetadata.postLogoutRedirectUris,
            isCompact: Boolean(isCompact),
            sampleUrls: {
              origin: 'http://localhost:3001/',
              callback: 'http://localhost:3001/callback',
            },
          }
      ) satisfies GuideContextType | undefined,
    [guide, app, tenantEndpoint?.href, applyCustomDomain, isCompact]
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
