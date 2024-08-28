import { type RouteObject } from 'react-router-dom';

import CustomizeJwt from '@/pages/CustomizeJwt';
import CustomizeJwtDetails from '@/pages/CustomizeJwtDetails';

export const customizeJwt: RouteObject = {
  path: 'customize-jwt',
  children: [
    { index: true, element: <CustomizeJwt /> },
    { path: ':tokenType/:action', element: <CustomizeJwtDetails /> },
  ],
};
