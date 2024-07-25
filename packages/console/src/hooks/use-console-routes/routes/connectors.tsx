import { Navigate } from 'react-router-dom';

import { ConnectorsTabs } from '@/consts';
import safeLazy from '@/utils/lazy';

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
