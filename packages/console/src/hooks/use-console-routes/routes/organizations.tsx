import { condArray } from '@silverhand/essentials';
import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import { OrganizationDetailsTabs } from '@/pages/OrganizationDetails/types';

const Organizations = lazy(async () => import('@/pages/Organizations'));
const OrganizationDetails = lazy(async () => import('@/pages/OrganizationDetails'));
const MachineToMachine = lazy(async () => import('@/pages/OrganizationDetails/MachineToMachine'));
const Members = lazy(async () => import('@/pages/OrganizationDetails/Members'));
const Settings = lazy(async () => import('@/pages/OrganizationDetails/Settings'));

export const organizations: RouteObject = {
  path: 'organizations',
  children: condArray(
    { index: true, element: <Organizations /> },
    { path: 'create', element: <Organizations /> },
    {
      path: ':id/*',
      element: <OrganizationDetails />,
      children: [
        { index: true, element: <Navigate replace to={OrganizationDetailsTabs.Settings} /> },
        { path: OrganizationDetailsTabs.Settings, element: <Settings /> },
        { path: OrganizationDetailsTabs.Members, element: <Members /> },
        {
          path: OrganizationDetailsTabs.MachineToMachine,
          element: <MachineToMachine />,
        },
      ],
    }
  ),
};
