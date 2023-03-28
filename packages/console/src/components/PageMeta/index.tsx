import type { AdminConsoleKey } from '@logto/phrases';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import { getAppInsights } from '@/utils/app-insights';

type Props = {
  titleKey: AdminConsoleKey | AdminConsoleKey[];
  // eslint-disable-next-line react/boolean-prop-naming
  trackPageView?: boolean;
};

function PageMeta({ titleKey, trackPageView = true }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [pageViewTracked, setPageViewTracked] = useState(false);
  const keys = typeof titleKey === 'string' ? [titleKey] : titleKey;
  const rawTitle = keys.map((key) => t(key, { lng: 'en' })).join(' - ');
  const title = keys.map((key) => t(key)).join(' - ');

  useEffect(() => {
    // Only track once for the same page
    if (trackPageView && !pageViewTracked) {
      getAppInsights()?.trackPageView({ name: rawTitle });
      setPageViewTracked(true);
    }
  }, [pageViewTracked, rawTitle, trackPageView]);

  return <Helmet title={title} />;
}

export default PageMeta;
