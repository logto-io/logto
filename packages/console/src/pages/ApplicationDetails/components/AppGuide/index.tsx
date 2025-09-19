import { type ApplicationResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useContext, useMemo, useState } from 'react';

import { guides } from '@/assets/docs/guides';
import Guide, { GuideContext, type GuideContextType } from '@/components/Guide';
import { AppDataContext } from '@/contexts/AppDataProvider';

import { type ApplicationSecretRow } from '../../ApplicationDetailsContent/EndpointsAndCredentials';

type Props = {
  readonly className?: string;
  readonly guideId: string;
  readonly app: ApplicationResponse;
  readonly secrets: ApplicationSecretRow[];
  readonly isCompact?: boolean;
  readonly onClose: () => void;
};

function AppGuide({ className, guideId, app, secrets, isCompact, onClose }: Props) {
  const { tenantEndpoint } = useContext(AppDataContext);
  const guide = guides.find(({ id }) => id === guideId);
  const [showAppSecret, setShowAppSecret] = useState(false);

  const memorizedContext = useMemo(
    () =>
      conditional(
        !!guide && {
          metadata: guide.metadata,
          Logo: guide.Logo,
          app,
          secrets,
          endpoint: tenantEndpoint?.href ?? '',
          redirectUris: app.oidcClientMetadata.redirectUris,
          postLogoutRedirectUris: app.oidcClientMetadata.postLogoutRedirectUris,
          isCompact: Boolean(isCompact),
          showAppSecret,
          setShowAppSecret,
        }
      ) satisfies GuideContextType | undefined,
    [guide, app, secrets, tenantEndpoint?.href, isCompact, showAppSecret]
  );

  return memorizedContext ? (
    <GuideContext.Provider value={memorizedContext}>
      <Guide
        className={className}
        guideId={guideId}
        isEmpty={!guide}
        isLoading={!app}
        onClose={onClose}
      />
    </GuideContext.Provider>
  ) : null;
}

export default AppGuide;
