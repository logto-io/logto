import { type Resource } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useContext, useMemo, useState } from 'react';

import { guides } from '@/assets/docs/guides';
import Guide, { GuideContext, type GuideContextType } from '@/components/Guide';
import { AppDataContext } from '@/contexts/AppDataProvider';

type Props = {
  readonly className?: string;
  readonly guideId: string;
  readonly apiResource?: Resource;
  readonly isCompact?: boolean;
  readonly onClose: () => void;
};

function ApiGuide({ className, guideId, apiResource, isCompact, onClose }: Props) {
  const { tenantEndpoint } = useContext(AppDataContext);
  const [showAppSecret, setShowAppSecret] = useState(false);

  const guide = guides.find(({ id }) => id === guideId);

  const memorizedContext = useMemo(
    () =>
      conditional(
        !!guide &&
          !!apiResource && {
            metadata: guide.metadata,
            Logo: guide.Logo,
            isCompact: Boolean(isCompact),
            endpoint: tenantEndpoint?.href ?? '',
            audience: apiResource.indicator,
            showAppSecret,
            setShowAppSecret,
          }
      ) satisfies GuideContextType | undefined,
    [apiResource, guide, isCompact, showAppSecret, tenantEndpoint?.href]
  );

  return memorizedContext ? (
    <GuideContext.Provider value={memorizedContext}>
      <Guide className={className} guideId={guideId} isLoading={!guide} onClose={onClose} />
    </GuideContext.Provider>
  ) : null;
}

export default ApiGuide;
