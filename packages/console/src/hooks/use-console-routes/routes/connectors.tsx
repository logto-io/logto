import { Navigate } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

import { ConnectorsTabs } from '@/consts';

const Connectors = safeLazy(async () => import('@/pages/Connectors'));
const ConnectorDetails = safeLazy(async () => import('@/pages/ConnectorDetails'));

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
