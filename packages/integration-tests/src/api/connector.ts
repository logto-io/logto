import type { Connector, ConnectorResponse } from '@logto/schemas';

import { authedAdminApi } from './api';

export const listConnectors = async () =>
  authedAdminApi.get('connectors').json<ConnectorResponse[]>();

export const getConnector = async (connectorId: string) =>
  authedAdminApi.get(`connectors/${connectorId}`).json<ConnectorResponse>();

// FIXME @Darcy: correct use of `id` and `connectorId`.
export const postConnector = async (connectorId: string, metadata?: Record<string, unknown>) =>
  authedAdminApi
    .post({
      url: `connectors`,
      json: { connectorId, metadata },
    })
    .json<Connector>();

export const deleteConnectorById = async (id: string) =>
  authedAdminApi.delete({ url: `connectors/${id}` }).json();

export const updateConnectorConfig = async (
  connectorId: string,
  config: Record<string, unknown>,
  metadata?: Record<string, unknown>
) =>
  authedAdminApi
    .patch({
      url: `connectors/${connectorId}`,
      json: { config, metadata },
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
