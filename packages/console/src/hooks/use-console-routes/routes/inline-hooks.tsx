import { type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

const InlineHooks = safeLazy(async () => import('@/pages/InlineHooks'));
const InlineHookDetails = safeLazy(async () => import('@/pages/InlineHooks/InlineHookDetails'));

export const inlineHooks: RouteObject = {
  path: 'inline-hooks',
  children: [
    { index: true, element: <InlineHooks /> },
    { path: ':hookType/:action', element: <InlineHookDetails /> },
  ],
};
