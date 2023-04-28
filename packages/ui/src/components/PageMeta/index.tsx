import { AppInsightsContext } from '@logto/app-insights/react';
import { type TFuncKey } from 'i18next';
import { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import { shouldTrack } from '@/utils/cookies';

type Props = {
  titleKey: TFuncKey | TFuncKey[];
  // eslint-disable-next-line react/boolean-prop-naming
  trackPageView?: boolean;
};

const PageMeta = ({ titleKey, trackPageView = true }: Props) => {
  const { t } = useTranslation();
  const { isSetupFinished, appInsights } = useContext(AppInsightsContext);
  const [pageViewTracked, setPageViewTracked] = useState(false);
  const keys = typeof titleKey === 'string' ? [titleKey] : titleKey;
  const rawTitle = keys.map((key) => t(key, { lng: 'en' })).join(' - ');
  const title = keys.map((key) => t(key)).join(' - ');

  useEffect(() => {
    // Only track once for the same page
    if (shouldTrack && isSetupFinished && trackPageView && !pageViewTracked) {
      appInsights.trackPageView?.({ name: `Main flow: ${rawTitle}` });
      setPageViewTracked(true);
    }
  }, [appInsights, isSetupFinished, pageViewTracked, rawTitle, trackPageView]);

  return <Helmet title={title} />;
};

export default PageMeta;
