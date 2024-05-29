import { appendPath } from '@silverhand/essentials';
import debug from 'debug';
import { useEffect } from 'react';
import { type RouteObject, useLocation } from 'react-router-dom';

import { plausibleDataDomain } from '@/components/Conversion/utils';
import { getRoutePattern } from '@/utils/route';

const log = debug('usePlausiblePageview');

/**
 * Track pageview with Plausible by listening to route changes.
 *
 * @param routes An array of route objects to match the current route against.
 * @param prefix A prefix to prepend to the route pattern.
 */
export const usePlausiblePageview = (routes: RouteObject[], prefix: string) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const routePattern = getRoutePattern(pathname, routes);

    log('pageview', routePattern);

    // https://plausible.io/docs/custom-locations#3-specify-a-custom-location
    window.plausible?.('pageview', {
      u:
        appendPath(new URL('https://' + plausibleDataDomain), prefix, routePattern).href +
        window.location.search,
    });
  }, [pathname, prefix, routes]);
};
