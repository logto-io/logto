import { Navigate, type RouteObject } from 'react-router-dom';

import { ApiResourceDetailsTabs } from '@/consts';
import ApiResourceDetails from '@/pages/ApiResourceDetails';
import ApiResourcePermissions from '@/pages/ApiResourceDetails/ApiResourcePermissions';
import ApiResourceSettings from '@/pages/ApiResourceDetails/ApiResourceSettings';
import ApiResources from '@/pages/ApiResources';

export const apiResources: RouteObject = {
  path: 'api-resources',
  children: [
    { index: true, element: <ApiResources /> },
    { path: 'create', element: <ApiResources /> },
    { path: ':id/guide/:guideId', element: <ApiResourceDetails /> },
    {
      path: ':id/*',
      element: <ApiResourceDetails />,
      children: [
        { index: true, element: <Navigate replace to={ApiResourceDetailsTabs.Permissions} /> },
        { path: ApiResourceDetailsTabs.Permissions, element: <ApiResourcePermissions /> },
        { path: ApiResourceDetailsTabs.General, element: <ApiResourceSettings /> },
      ],
    },
  ],
};
