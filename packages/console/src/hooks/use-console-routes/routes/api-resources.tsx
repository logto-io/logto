import { type RouteObject } from 'react-router-dom';

import ApiResourceDetails from '@/pages/ApiResourceDetails';
import ApiResources from '@/pages/ApiResources';

export const apiResources: RouteObject = {
  path: 'api-resources',
  children: [
    { index: true, element: <ApiResources /> },
    { path: 'create', element: <ApiResources /> },
    { path: ':id/guide/:guideId', element: <ApiResourceDetails /> },
    { path: ':id/*', element: <ApiResourceDetails /> },
  ],
};
