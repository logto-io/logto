import { condArray } from '@silverhand/essentials';
import { Navigate, type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

import { OrganizationDetailsTabs } from '@/pages/OrganizationDetails/types';

const Organizations = safeLazy(async () => import('@/pages/Organizations'));
const OrganizationDetails = safeLazy(async () => import('@/pages/OrganizationDetails'));
const MachineToMachine = safeLazy(
  async () => import('@/pages/OrganizationDetails/MachineToMachine')
);
const Members = safeLazy(async () => import('@/pages/OrganizationDetails/Members'));
const Settings = safeLazy(async () => import('@/pages/OrganizationDetails/Settings'));

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
