import { appendPath } from '@silverhand/essentials';
import debug from 'debug';
import { useEffect } from 'react';
import { type RouteObject, useLocation } from 'react-router-dom';

import { plausibleDataDomain } from '@/components/Conversion/utils';
import { getRoutePattern } from '@/utils/route';

const log = debug('usePlausiblePageview');

export const usePlausiblePageview = (routes: RouteObject[]) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const routePattern = getRoutePattern(pathname, routes);

    log('pageview', routePattern);

    // https://plausible.io/docs/custom-locations#3-specify-a-custom-location
    window.plausible?.('pageview', {
      u:
        appendPath(new URL('https://' + plausibleDataDomain), routePattern).href +
        window.location.search,
    });
  }, [pathname, routes]);
};
