import { type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

const Security = safeLazy(async () => import('@/pages/Security'));
const CaptchaDetails = safeLazy(async () => import('@/pages/CaptchaDetails'));

export const security: RouteObject = {
  path: 'security',
  children: [
    { index: true, element: <Security /> },
    { path: 'guide/:guideId', element: <Security /> },
    {
      path: 'captcha',
      element: <CaptchaDetails />,
    },
  ],
};
