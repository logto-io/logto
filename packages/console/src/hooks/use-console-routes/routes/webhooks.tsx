import { Navigate, type RouteObject } from 'react-router-dom';

import { WebhookDetailsTabs } from '@/consts';
import AuditLogDetails from '@/pages/AuditLogDetails';
import WebhookDetails from '@/pages/WebhookDetails';
import WebhookLogs from '@/pages/WebhookDetails/WebhookLogs';
import WebhookSettings from '@/pages/WebhookDetails/WebhookSettings';
import Webhooks from '@/pages/Webhooks';

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
