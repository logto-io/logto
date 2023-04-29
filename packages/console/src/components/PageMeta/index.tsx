import { AppInsightsContext } from '@logto/app-insights/react';
import type { AdminConsoleKey } from '@logto/phrases';
import { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

export type Props = {
  titleKey: AdminConsoleKey | AdminConsoleKey[];
  // eslint-disable-next-line react/boolean-prop-naming
  trackPageView?: boolean;
};

function PageMeta({ titleKey, trackPageView = true }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { isSetupFinished, appInsights } = useContext(AppInsightsContext);
  const [pageViewTracked, setPageViewTracked] = useState(false);
  const keys = typeof titleKey === 'string' ? [titleKey] : titleKey;
  const rawTitle = keys.map((key) => t(key, { lng: 'en' })).join(' - ');
  const title = keys.map((key) => t(key)).join(' - ');

  useEffect(() => {
    // Only track once for the same page
    if (isSetupFinished && trackPageView && !pageViewTracked) {
      appInsights.trackPageView?.({ name: `Console: ${rawTitle}` });
      setPageViewTracked(true);
    }
  }, [appInsights, isSetupFinished, pageViewTracked, rawTitle, trackPageView]);

  return <Helmet title={title} />;
}

export default PageMeta;
