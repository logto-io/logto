import { type RouteObject } from 'react-router-dom';

import safeLazy from '@/utils/lazy';

const Mfa = safeLazy(async () => import('@/pages/Mfa'));

export const mfa: RouteObject = { path: 'mfa', element: <Mfa /> };
