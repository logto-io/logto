import { type RouteObject } from 'react-router-dom';

import safeLazy from '@/utils/lazy';

const AuditLogs = safeLazy(async () => import('@/pages/AuditLogs'));
const AuditLogDetails = safeLazy(async () => import('@/pages/AuditLogDetails'));

export const auditLogs: RouteObject = {
  path: 'audit-logs',
  children: [
    { index: true, element: <AuditLogs /> },
    { path: ':logId', element: <AuditLogDetails /> },
  ],
};
