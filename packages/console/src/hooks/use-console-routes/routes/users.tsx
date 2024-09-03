import { Navigate, type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

import { UserDetailsTabs } from '@/consts/page-tabs';

const AuditLogDetails = safeLazy(async () => import('@/pages/AuditLogDetails'));
const UserDetails = safeLazy(async () => import('@/pages/UserDetails'));
const UserLogs = safeLazy(async () => import('@/pages/UserDetails/UserLogs'));
const UserOrganizations = safeLazy(async () => import('@/pages/UserDetails/UserOrganizations'));
const UserRoles = safeLazy(async () => import('@/pages/UserDetails/UserRoles'));
const UserSettings = safeLazy(async () => import('@/pages/UserDetails/UserSettings'));
const Users = safeLazy(async () => import('@/pages/Users'));

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
