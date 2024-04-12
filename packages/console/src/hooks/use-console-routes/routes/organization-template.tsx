import { Navigate, type RouteObject } from 'react-router-dom';

import { OrganizationTemplateTabs } from '@/consts';
import OrganizationRoleDetails from '@/pages/OrganizationRoleDetails';
import OrganizationTemplate from '@/pages/OrganizationTemplate';
import OrganizationPermissions from '@/pages/OrganizationTemplate/OrganizationPermissions';
import OrganizationRoles from '@/pages/OrganizationTemplate/OrganizationRoles';

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
  },
];
