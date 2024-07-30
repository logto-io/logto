import { type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

const CustomizeJwt = safeLazy(async () => import('@/pages/CustomizeJwt'));
const CustomizeJwtDetails = safeLazy(async () => import('@/pages/CustomizeJwtDetails'));

export const customizeJwt: RouteObject = {
  path: 'customize-jwt',
  children: [
    { index: true, element: <CustomizeJwt /> },
    { path: ':tokenType/:action', element: <CustomizeJwtDetails /> },
  ],
};
