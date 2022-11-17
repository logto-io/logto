import type { ConnectorResponse } from '@logto/schemas';

import { authedAdminApi } from './api';

export const listConnectors = async () =>
  authedAdminApi.get('connectors').json<ConnectorResponse[]>();

export const getConnector = async (connectorId: string) =>
  authedAdminApi.get(`connectors/${connectorId}`).json<ConnectorResponse>();

export const postConnector = async (connectorId: string) =>
  authedAdminApi
    .post({ url: `connectors/${connectorId}`, json: { metadata: { logo: 'new_logo' } } })
    .json();

export const updateConnectorConfig = async (connectorId: string, config: Record<string, unknown>) =>
  authedAdminApi
    .patch({
      url: `connectors/${connectorId}`,
      json: { config },
    })
    .json<ConnectorResponse>();

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
    .json<ConnectorResponse>();

export const sendSmsTestMessage = async (
  connectorId: string,
  phone: string,
  config: Record<string, unknown>
) => sendTestMessage(connectorId, 'phone', phone, config);

export const sendEmailTestMessage = async (
  connectorId: string,
  email: string,
  config: Record<string, unknown>
) => sendTestMessage(connectorId, 'email', email, config);

const sendTestMessage = async (
  connectorId: string,
  receiverType: 'phone' | 'email',
  receiver: string,
  config: Record<string, unknown>
) =>
  authedAdminApi.post({
    url: `connectors/${connectorId}/test`,
    json: { [receiverType]: receiver, config },
  });
