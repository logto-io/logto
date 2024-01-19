import { AppInsightsContext } from '@logto/app-insights/react';
import { type TFuncKey } from 'i18next';
import { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import { shouldTrack } from '@/utils/cookies';

type Props = {
  titleKey: TFuncKey;
  titleKeyInterpolation?: Record<string, unknown>;
  // eslint-disable-next-line react/boolean-prop-naming
  trackPageView?: boolean;
};

const PageMeta = ({ titleKey, titleKeyInterpolation = {}, trackPageView = true }: Props) => {
  const { t } = useTranslation();
  const { isSetupFinished, appInsights } = useContext(AppInsightsContext);
  const [pageViewTracked, setPageViewTracked] = useState(false);

  const rawTitle = t(titleKey, { lng: 'en', ...titleKeyInterpolation });
  const title = t(titleKey, titleKeyInterpolation);

  useEffect(() => {
    // Only track once for the same page
    if (shouldTrack && isSetupFinished && trackPageView && !pageViewTracked) {
      appInsights.trackPageView?.({ name: `Main flow: ${String(rawTitle)}` });
      setPageViewTracked(true);
    }
  }, [appInsights, isSetupFinished, pageViewTracked, rawTitle, trackPageView]);

  return <Helmet title={String(title)} />;
};

export default PageMeta;
