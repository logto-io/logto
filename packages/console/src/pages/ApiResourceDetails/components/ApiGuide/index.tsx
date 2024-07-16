import { type Resource } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useContext, useMemo } from 'react';

import { guides } from '@/assets/docs/guides';
import Guide, { GuideContext, type GuideContextType } from '@/components/Guide';
import { AppDataContext } from '@/contexts/AppDataProvider';
import useCustomDomain from '@/hooks/use-custom-domain';

type Props = {
  readonly className?: string;
  readonly guideId: string;
  readonly apiResource?: Resource;
  readonly isCompact?: boolean;
  readonly onClose: () => void;
};

function ApiGuide({ className, guideId, apiResource, isCompact, onClose }: Props) {
  const { tenantEndpoint } = useContext(AppDataContext);
  const { applyDomain: applyCustomDomain } = useCustomDomain();
  const guide = guides.find(({ id }) => id === guideId);

  const memorizedContext = useMemo(
    () =>
      conditional(
        !!guide &&
          !!apiResource && {
            metadata: guide.metadata,
            Logo: guide.Logo,
            isCompact: Boolean(isCompact),
            endpoint: applyCustomDomain(tenantEndpoint?.href ?? ''),
            audience: apiResource.indicator,
          }
      ) satisfies GuideContextType | undefined,
    [apiResource, applyCustomDomain, guide, isCompact, tenantEndpoint?.href]
  );

  return memorizedContext ? (
    <GuideContext.Provider value={memorizedContext}>
      <Guide className={className} guideId={guideId} isLoading={!guide} onClose={onClose} />
    </GuideContext.Provider>
  ) : null;
}

export default ApiGuide;
