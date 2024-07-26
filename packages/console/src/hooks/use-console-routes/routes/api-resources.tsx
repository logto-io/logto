import { Navigate, type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

import { ApiResourceDetailsTabs } from '@/consts';

const ApiResources = safeLazy(async () => import('@/pages/ApiResources'));
const ApiResourceDetails = safeLazy(async () => import('@/pages/ApiResourceDetails'));
const ApiResourcePermissions = safeLazy(
  async () => import('@/pages/ApiResourceDetails/ApiResourcePermissions')
);
const ApiResourceSettings = safeLazy(
  async () => import('@/pages/ApiResourceDetails/ApiResourceSettings')
);

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
