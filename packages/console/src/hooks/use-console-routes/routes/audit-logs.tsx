import { type RouteObject } from 'react-router-dom';

import AuditLogDetails from '@/pages/AuditLogDetails';
import AuditLogs from '@/pages/AuditLogs';

export const auditLogs: RouteObject = {
  path: 'audit-logs',
  children: [
    { index: true, element: <AuditLogs /> },
    { path: ':logId', element: <AuditLogDetails /> },
  ],
};
