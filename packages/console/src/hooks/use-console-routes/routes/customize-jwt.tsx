import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';

const CustomizeJwt = lazy(async () => import('@/pages/CustomizeJwt'));
const CustomizeJwtDetails = lazy(async () => import('@/pages/CustomizeJwtDetails'));

export const customizeJwt: RouteObject = {
  path: 'customize-jwt',
  children: [
    { index: true, element: <CustomizeJwt /> },
    { path: ':tokenType/:action', element: <CustomizeJwtDetails /> },
  ],
};
