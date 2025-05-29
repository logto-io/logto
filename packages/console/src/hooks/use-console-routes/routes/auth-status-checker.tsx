import { type RouteObject } from 'react-router-dom';

import AuthStatusChecker from '@/pages/AuthStatusChecker';

export const authStatusChecker: RouteObject = {
  path: 'auth-status-checker',
  element: <AuthStatusChecker />,
};
