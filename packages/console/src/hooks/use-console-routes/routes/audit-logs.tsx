import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';

const AuditLogs = lazy(async () => import('@/pages/AuditLogs'));
const AuditLogDetails = lazy(async () => import('@/pages/AuditLogDetails'));

export const auditLogs: RouteObject = {
  path: 'audit-logs',
  children: [
    { index: true, element: <AuditLogs /> },
    { path: ':logId', element: <AuditLogDetails /> },
  ],
};
