import { ConnectorDto } from '@logto/schemas';

import { authedAdminApi } from './api';

export const listConnectors = async () => authedAdminApi.get('connectors').json<ConnectorDto[]>();

export const getConnector = async (connectorId: string) =>
  authedAdminApi.get(`connectors/${connectorId}`).json<ConnectorDto>();

export const updateConnectorConfig = async (connectorId: string, config: Record<string, unknown>) =>
  authedAdminApi
    .patch({
      url: `connectors/${connectorId}`,
      json: { config },
    })
    .json<ConnectorDto>();

export const enableConnector = async (connectorId: string) =>
  updateConnectorEnabledProperty(connectorId, true);

export const disableConnector = async (connectorId: string) =>
  updateConnectorEnabledProperty(connectorId, false);

const updateConnectorEnabledProperty = (connectorId: string, enabled: boolean) =>
  authedAdminApi
    .patch({
      url: `connectors/${connectorId}/enabled`,
      json: { enabled },
    })
    .json<ConnectorDto>();
