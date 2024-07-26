import { Navigate, type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

import { OrganizationRoleDetailsTabs, OrganizationTemplateTabs } from '@/consts';

const OrganizationTemplate = safeLazy(async () => import('@/pages/OrganizationTemplate'));
const OrganizationRoles = safeLazy(
  async () => import('@/pages/OrganizationTemplate/OrganizationRoles')
);
const OrganizationPermissions = safeLazy(
  async () => import('@/pages/OrganizationTemplate/OrganizationPermissions')
);
const OrganizationRoleDetails = safeLazy(async () => import('@/pages/OrganizationRoleDetails'));
const Permissions = safeLazy(async () => import('@/pages/OrganizationRoleDetails/Permissions'));
const Settings = safeLazy(async () => import('@/pages/OrganizationRoleDetails/Settings'));

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
