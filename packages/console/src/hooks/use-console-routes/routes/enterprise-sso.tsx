import { Navigate, type RouteObject } from 'react-router-dom';

import { EnterpriseSsoDetailsTabs } from '@/consts/page-tabs';
import EnterpriseSso from '@/pages/EnterpriseSso';
import EnterpriseSsoDetails from '@/pages/EnterpriseSsoDetails';

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
