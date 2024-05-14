import { matchRoutes, type RouteObject } from 'react-router-dom';

export const getRoutePattern = (pathname: string, routes: RouteObject[]) => {
  // Remove the first segment of the pathname, which is the tenant ID.
  const normalized = pathname.replace(/^\/[^/]+/, '');
  const matches = matchRoutes(routes, normalized) ?? [];
  return (
    '/' +
    matches
      .filter((match) => !match.route.index)
      .flatMap(({ route: { path }, params }) => {
        // Path could have multiple segments, e.g. 'api-resources/:id/*'.
        const segments = path?.split('/') ?? [];

        return segments.map((segment) => {
          if (segment === '*') {
            return params['*'] ?? segment;
          }

          // If the path is not a parameter, or it's an ID parameter, use the path as is.
          // Exception: For `:guideId`, we want to use the parameter value for better analytics.
          if (
            segment !== ':guideId' &&
            (!segment.startsWith(':') || segment.endsWith('Id') || segment.endsWith('id'))
          ) {
            return segment;
          }

          // Otherwise, use the parameter value.
          return params[segment.slice(1)] ?? segment;
        });
      })
      .join('/')
  );
};
