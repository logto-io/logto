import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import { WebhookDetailsTabs } from '@/consts';

const WebhookDetails = lazy(async () => import('@/pages/WebhookDetails'));
const AuditLogDetails = lazy(async () => import('@/pages/AuditLogDetails'));
const WebhookSettings = lazy(async () => import('@/pages/WebhookDetails/WebhookSettings'));
const WebhookLogs = lazy(async () => import('@/pages/WebhookDetails/WebhookLogs'));
const Webhooks = lazy(async () => import('@/pages/Webhooks'));

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
