import { condArray } from '@silverhand/essentials';
import { Navigate, type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

import { ApplicationDetailsTabs } from '@/consts';
import { dynamicAppId } from '@/types/applications';

const Applications = safeLazy(async () => import('@/pages/Applications'));
const ApplicationDetails = safeLazy(async () => import('@/pages/ApplicationDetails'));
const DynamicAppDetails = safeLazy(async () => import('@/pages/DynamicAppDetails'));
const AuditLogDetails = safeLazy(async () => import('@/pages/AuditLogDetails'));

export const applications: RouteObject = {
  path: 'applications',
  children: condArray(
    { index: true, element: <Applications /> },
    {
      path: 'third-party-applications',
      element: <Applications tab="thirdPartyApplications" />,
    },
    { path: 'create', element: <Applications /> },
    { path: ':id/guide/:guideId', element: <ApplicationDetails /> },
    {
      path: dynamicAppId,
      children: [
        { index: true, element: <Navigate replace to={ApplicationDetailsTabs.Settings} /> },
        { path: ':tab', element: <DynamicAppDetails /> },
      ],
    },
    {
      path: ':id',
      children: [
        { index: true, element: <Navigate replace to={ApplicationDetailsTabs.Settings} /> },
        { path: ':tab', element: <ApplicationDetails /> },
      ],
    },
    { path: `:appId/${ApplicationDetailsTabs.Logs}/:logId`, element: <AuditLogDetails /> }
  ),
};
