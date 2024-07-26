import { Navigate, type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

import { WebhookDetailsTabs } from '@/consts';

const WebhookDetails = safeLazy(async () => import('@/pages/WebhookDetails'));
const AuditLogDetails = safeLazy(async () => import('@/pages/AuditLogDetails'));
const WebhookSettings = safeLazy(async () => import('@/pages/WebhookDetails/WebhookSettings'));
const WebhookLogs = safeLazy(async () => import('@/pages/WebhookDetails/WebhookLogs'));
const Webhooks = safeLazy(async () => import('@/pages/Webhooks'));

export const webhooks: RouteObject = {
  path: 'webhooks',
  children: [
    { index: true, element: <Webhooks /> },
    { path: 'create', element: <Webhooks /> },
    {
      path: ':id',
      element: <WebhookDetails />,
      children: [
        { index: true, element: <Navigate replace to={WebhookDetailsTabs.Settings} /> },
        { path: WebhookDetailsTabs.Settings, element: <WebhookSettings /> },
        { path: WebhookDetailsTabs.RecentRequests, element: <WebhookLogs /> },
      ],
    },
    {
      path: `:hookId/${WebhookDetailsTabs.RecentRequests}/:logId`,
      element: <AuditLogDetails />,
    },
  ],
};
