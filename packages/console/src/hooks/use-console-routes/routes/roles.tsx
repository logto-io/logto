import { Navigate, type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

import { RoleDetailsTabs } from '@/consts/page-tabs';

const Roles = safeLazy(async () => import('@/pages/Roles'));
const RoleDetails = safeLazy(async () => import('@/pages/RoleDetails'));
const RolePermissions = safeLazy(async () => import('@/pages/RoleDetails/RolePermissions'));
const RoleSettings = safeLazy(async () => import('@/pages/RoleDetails/RoleSettings'));
const RoleUsers = safeLazy(async () => import('@/pages/RoleDetails/RoleUsers'));
const RoleApplications = safeLazy(async () => import('@/pages/RoleDetails/RoleApplications'));

export const roles: RouteObject = {
  path: 'roles',
  children: [
    { index: true, element: <Roles /> },
    { path: 'create', element: <Roles /> },
    {
      path: ':id',
      element: <RoleDetails />,
      children: [
        { index: true, element: <Navigate replace to={RoleDetailsTabs.Permissions} /> },
        { path: RoleDetailsTabs.Permissions, element: <RolePermissions /> },
        { path: RoleDetailsTabs.Users, element: <RoleUsers /> },
        { path: RoleDetailsTabs.M2mApps, element: <RoleApplications /> },
        { path: RoleDetailsTabs.General, element: <RoleSettings /> },
      ],
    },
  ],
};
