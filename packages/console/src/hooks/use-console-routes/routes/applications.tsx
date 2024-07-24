import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import { ApplicationDetailsTabs } from '@/consts';

const Applications = lazy(async () => import('@/pages/Applications'));
const ApplicationDetails = lazy(async () => import('@/pages/ApplicationDetails'));
const AuditLogDetails = lazy(async () => import('@/pages/AuditLogDetails'));

export const applications: RouteObject = {
  path: 'applications',
  children: [
    { index: true, element: <Applications /> },
    {
      path: 'third-party-applications',
      element: <Applications tab="thirdPartyApplications" />,
    },
    { path: 'create', element: <Applications /> },
    { path: ':id/guide/:guideId', element: <ApplicationDetails /> },
    {
      path: ':id',
      children: [
        { index: true, element: <Navigate replace to={ApplicationDetailsTabs.Settings} /> },
        { path: ':tab', element: <ApplicationDetails /> },
      ],
    },
    { path: `:appId/${ApplicationDetailsTabs.Logs}/:logId`, element: <AuditLogDetails /> },
  ],
};
