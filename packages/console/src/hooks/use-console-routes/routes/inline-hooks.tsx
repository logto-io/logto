import { type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

const InlineHooks = safeLazy(async () => import('@/pages/InlineHooks'));

export const inlineHooks: RouteObject = {
  path: 'inline-hooks',
  children: [{ index: true, element: <InlineHooks /> }],
};
