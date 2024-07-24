import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

import { ConnectorsTabs } from '@/consts';

const Connectors = lazy(async () => import('@/pages/Connectors'));
const ConnectorDetails = lazy(async () => import('@/pages/ConnectorDetails'));

export const connectors = {
  path: 'connectors',
  children: [
    { index: true, element: <Navigate replace to={ConnectorsTabs.Passwordless} /> },
    { path: ':tab', element: <Connectors /> },
    { path: ':tab/create/:createType', element: <Connectors /> },
    { path: ':tab/guide/:factoryId', element: <Connectors /> },
    { path: ':tab/:connectorId', element: <ConnectorDetails /> },
  ],
};
