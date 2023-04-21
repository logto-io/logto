import { useAppInsights } from '@logto/app-insights/react';
import { type TFuncKey } from 'i18next';
import { useEffect, useState } from 'react';
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
  const { initialized, appInsights } = useAppInsights();
  const [pageViewTracked, setPageViewTracked] = useState(false);
  const keys = typeof titleKey === 'string' ? [titleKey] : titleKey;
  const rawTitle = keys.map((key) => t(key, { lng: 'en' })).join(' - ');
  const title = keys.map((key) => t(key)).join(' - ');

  useEffect(() => {
    // Only track once for the same page
    if (shouldTrack && initialized && trackPageView && !pageViewTracked) {
      appInsights.trackPageView?.({ name: [rawTitle, 'SIE'].join(' - ') });
      setPageViewTracked(true);
    }
  }, [appInsights, initialized, pageViewTracked, rawTitle, trackPageView]);

  return <Helmet title={title} />;
};

export default PageMeta;
