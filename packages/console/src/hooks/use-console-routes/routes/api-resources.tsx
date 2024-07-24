import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import { ApiResourceDetailsTabs } from '@/consts';

const ApiResources = lazy(async () => import('@/pages/ApiResources'));
const ApiResourceDetails = lazy(async () => import('@/pages/ApiResourceDetails'));
const ApiResourcePermissions = lazy(
  async () => import('@/pages/ApiResourceDetails/ApiResourcePermissions')
);
const ApiResourceSettings = lazy(
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
