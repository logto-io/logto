import { Navigate, type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

import { EnterpriseSsoDetailsTabs } from '@/consts/page-tabs';

const EnterpriseSso = safeLazy(async () => import('@/pages/EnterpriseSso'));
const EnterpriseSsoDetails = safeLazy(async () => import('@/pages/EnterpriseSsoDetails'));

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
