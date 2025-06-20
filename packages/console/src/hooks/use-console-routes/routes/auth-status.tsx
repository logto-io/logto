import { type RouteObject } from 'react-router-dom';

import AuthStatus from '@/pages/AuthStatus';

export const authStatus: RouteObject = {
  path: 'auth-status',
  element: <AuthStatus />,
};
