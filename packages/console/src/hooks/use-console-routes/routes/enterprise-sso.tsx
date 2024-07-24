import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import { EnterpriseSsoDetailsTabs } from '@/consts/page-tabs';

const EnterpriseSso = lazy(async () => import('@/pages/EnterpriseSso'));
const EnterpriseSsoDetails = lazy(async () => import('@/pages/EnterpriseSsoDetails'));

export const enterpriseSso: RouteObject = {
  path: 'enterprise-sso',
  children: [
    { index: true, element: <EnterpriseSso /> },
    { path: 'create', element: <EnterpriseSso /> },
    {
      path: ':ssoConnectorId',
      children: [
        {
          index: true,
          element: <Navigate replace to={EnterpriseSsoDetailsTabs.Connection} />,
        },
        { path: ':tab', element: <EnterpriseSsoDetails /> },
      ],
    },
  ],
};
