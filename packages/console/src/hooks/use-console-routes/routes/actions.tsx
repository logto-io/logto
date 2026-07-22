import { type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

const Actions = safeLazy(async () => import('@/pages/Actions'));
const ActionDetails = safeLazy(async () => import('@/pages/Actions/ActionDetails'));

export const actions: RouteObject = {
  path: 'actions',
  children: [
    { index: true, element: <Actions /> },
    { path: ':actionType/:mode', element: <ActionDetails /> },
  ],
};
