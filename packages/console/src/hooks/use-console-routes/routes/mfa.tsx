import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';

const Mfa = lazy(async () => import('@/pages/Mfa'));

export const mfa: RouteObject = { path: 'mfa', element: <Mfa /> };
