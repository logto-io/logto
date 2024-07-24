import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import { OrganizationRoleDetailsTabs, OrganizationTemplateTabs } from '@/consts';

const OrganizationTemplate = lazy(async () => import('@/pages/OrganizationTemplate'));
const OrganizationRoles = lazy(
  async () => import('@/pages/OrganizationTemplate/OrganizationRoles')
);
const OrganizationPermissions = lazy(
  async () => import('@/pages/OrganizationTemplate/OrganizationPermissions')
);
const OrganizationRoleDetails = lazy(async () => import('@/pages/OrganizationRoleDetails'));
const Permissions = lazy(async () => import('@/pages/OrganizationRoleDetails/Permissions'));
const Settings = lazy(async () => import('@/pages/OrganizationRoleDetails/Settings'));

export const organizationTemplate: RouteObject[] = [
  {
    path: 'organization-template',
    element: <OrganizationTemplate />,
    children: [
      {
        index: true,
        element: <Navigate replace to={OrganizationTemplateTabs.OrganizationRoles} />,
      },
      { path: OrganizationTemplateTabs.OrganizationRoles, element: <OrganizationRoles /> },
      {
        path: OrganizationTemplateTabs.OrganizationPermissions,
        element: <OrganizationPermissions />,
      },
    ],
  },
  {
    path: `organization-template/${OrganizationTemplateTabs.OrganizationRoles}/:id/*`,
    element: <OrganizationRoleDetails />,
    children: [
      {
        index: true,
        element: <Navigate replace to={OrganizationRoleDetailsTabs.Permissions} />,
      },
      { path: OrganizationRoleDetailsTabs.Permissions, element: <Permissions /> },
      { path: OrganizationRoleDetailsTabs.General, element: <Settings /> },
    ],
  },
];
