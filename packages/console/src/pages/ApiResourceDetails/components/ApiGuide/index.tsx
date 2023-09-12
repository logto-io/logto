import { conditional } from '@silverhand/essentials';
import { useMemo } from 'react';

import guides from '@/assets/docs/guides';
import Guide, { GuideContext, type GuideContextType } from '@/components/Guide';

type Props = {
  className?: string;
  guideId: string;
  isCompact?: boolean;
  onClose: () => void;
};

function ApiGuide({ className, guideId, isCompact, onClose }: Props) {
  const guide = guides.find(({ id }) => id === guideId);

  const memorizedContext = useMemo(
    () =>
      conditional(
        !!guide && {
          metadata: guide.metadata,
          Logo: guide.Logo,
          isCompact: Boolean(isCompact),
        }
      ) satisfies GuideContextType | undefined,
    [guide, isCompact]
  );

  return memorizedContext ? (
    <GuideContext.Provider value={memorizedContext}>
      <Guide className={className} guideId={guideId} isLoading={!guide} onClose={onClose} />
    </GuideContext.Provider>
  ) : null;
}

export default ApiGuide;
