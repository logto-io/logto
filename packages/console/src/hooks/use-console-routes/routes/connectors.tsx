import { Navigate } from 'react-router-dom';

import { ConnectorsTabs } from '@/consts';
import ConnectorDetails from '@/pages/ConnectorDetails';
import Connectors from '@/pages/Connectors';

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
