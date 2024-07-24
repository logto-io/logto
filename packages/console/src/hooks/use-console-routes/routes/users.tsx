import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import { UserDetailsTabs } from '@/consts/page-tabs';

const AuditLogDetails = lazy(async () => import('@/pages/AuditLogDetails'));
const UserDetails = lazy(async () => import('@/pages/UserDetails'));
const UserLogs = lazy(async () => import('@/pages/UserDetails/UserLogs'));
const UserOrganizations = lazy(async () => import('@/pages/UserDetails/UserOrganizations'));
const UserRoles = lazy(async () => import('@/pages/UserDetails/UserRoles'));
const UserSettings = lazy(async () => import('@/pages/UserDetails/UserSettings'));
const Users = lazy(async () => import('@/pages/Users'));

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
