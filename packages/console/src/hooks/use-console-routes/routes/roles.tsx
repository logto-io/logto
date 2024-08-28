import { Navigate, type RouteObject } from 'react-router-dom';

import { RoleDetailsTabs } from '@/consts/page-tabs';
import RoleDetails from '@/pages/RoleDetails';
import RoleApplications from '@/pages/RoleDetails/RoleApplications';
import RolePermissions from '@/pages/RoleDetails/RolePermissions';
import RoleSettings from '@/pages/RoleDetails/RoleSettings';
import RoleUsers from '@/pages/RoleDetails/RoleUsers';
import Roles from '@/pages/Roles';

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
