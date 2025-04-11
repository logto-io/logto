import { Navigate, type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

import { SecurityTabs } from '@/pages/Security/types';

const Security = safeLazy(async () => import('@/pages/Security'));
const CaptchaDetails = safeLazy(async () => import('@/pages/CaptchaDetails'));

export const security: RouteObject = {
  path: 'security',
  children: [
    { index: true, element: <Navigate replace to={SecurityTabs.Captcha} /> },
    { path: SecurityTabs.Captcha, element: <Security tab={SecurityTabs.Captcha} /> },
    {
      path: `${SecurityTabs.Captcha}/guide/:guideId`,
      element: <Security tab={SecurityTabs.Captcha} />,
    },
    {
      path: `${SecurityTabs.Captcha}/details`,
      element: <CaptchaDetails />,
    },
    {
      path: SecurityTabs.PasswordPolicy,
      element: <Security tab={SecurityTabs.PasswordPolicy} />,
    },
    {
      path: SecurityTabs.General,
      element: <Security tab={SecurityTabs.General} />,
    },
  ],
};
