import { type RouteObject } from 'react-router-dom';

import Security from '@/pages/Security';

export const security: RouteObject = {
  path: 'security',
  children: [{ index: true, element: <Security /> }],
};
