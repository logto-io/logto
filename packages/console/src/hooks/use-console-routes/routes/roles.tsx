import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import { RoleDetailsTabs } from '@/consts/page-tabs';

const Roles = lazy(async () => import('@/pages/Roles'));
const RoleDetails = lazy(async () => import('@/pages/RoleDetails'));
const RolePermissions = lazy(async () => import('@/pages/RoleDetails/RolePermissions'));
const RoleSettings = lazy(async () => import('@/pages/RoleDetails/RoleSettings'));
const RoleUsers = lazy(async () => import('@/pages/RoleDetails/RoleUsers'));
const RoleApplications = lazy(async () => import('@/pages/RoleDetails/RoleApplications'));

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
