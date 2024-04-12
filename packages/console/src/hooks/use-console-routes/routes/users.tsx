import { Navigate, type RouteObject } from 'react-router-dom';

import { UserDetailsTabs } from '@/consts/page-tabs';
import AuditLogDetails from '@/pages/AuditLogDetails';
import UserDetails from '@/pages/UserDetails';
import UserLogs from '@/pages/UserDetails/UserLogs';
import UserOrganizations from '@/pages/UserDetails/UserOrganizations';
import UserRoles from '@/pages/UserDetails/UserRoles';
import UserSettings from '@/pages/UserDetails/UserSettings';
import Users from '@/pages/Users';

export const users: RouteObject = {
  path: 'users',
  children: [
    { index: true, element: <Users /> },
    { path: 'create', element: <Users /> },
    {
      path: ':id',
      element: <UserDetails />,
      children: [
        { index: true, element: <Navigate replace to={UserDetailsTabs.Settings} /> },
        { path: UserDetailsTabs.Settings, element: <UserSettings /> },
        { path: UserDetailsTabs.Roles, element: <UserRoles /> },
        { path: UserDetailsTabs.Logs, element: <UserLogs /> },
        { path: UserDetailsTabs.Organizations, element: <UserOrganizations /> },
      ],
    },
    { path: `:userId/${UserDetailsTabs.Logs}/:logId`, element: <AuditLogDetails /> },
  ],
};
