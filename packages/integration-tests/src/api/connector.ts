import type {
  Connector,
  ConnectorFactoryResponse,
  ConnectorResponse,
  CreateConnector,
} from '@logto/schemas';

import { authedAdminApi } from './api.js';

/**
 * We are using `id` and `connectorFactoryId` here:
 *
 * - `id` is used to identify connectors from the database.
 * - `connectorFactoryId` is used to identify connectors - more specifically, connector factories - in packages/connectors
 * that contain metadata (considered connectors' FIXED properties) and code implementation (which determines how connectors work).
 */

export const listConnectors = async () =>
  authedAdminApi.get('connectors').json<ConnectorResponse[]>();

export const getConnector = async (id: string) =>
  authedAdminApi.get(`connectors/${id}`).json<ConnectorResponse>();

export const listConnectorFactories = async () =>
  authedAdminApi.get('connector-factories').json<ConnectorFactoryResponse[]>();

export const getConnectorFactory = async (connectorFactoryId: string) =>
  authedAdminApi.get(`connector-factories/${connectorFactoryId}`).json<ConnectorFactoryResponse>();

export const postConnector = async (
  payload: Pick<CreateConnector, 'connectorId' | 'config' | 'metadata' | 'syncProfile'>
) =>
  authedAdminApi
    .post({
      url: `connectors`,
      json: payload,
    })
    .json<Connector>();

export const deleteConnectorById = async (id: string) =>
  authedAdminApi.delete({ url: `connectors/${id}` }).json();

export const updateConnectorConfig = async (
  id: string,
  config: Record<string, unknown>,
  metadata?: Record<string, unknown>
) =>
  authedAdminApi
    .patch({
      url: `connectors/${id}`,
      json: { config, metadata },
    })
    .json<ConnectorResponse>();

export const sendSmsTestMessage = async (
  connectorFactoryId: string,
  phone: string,
  config: Record<string, unknown>
) => sendTestMessage(connectorFactoryId, 'phone', phone, config);

export const sendEmailTestMessage = async (
  connectorFactoryId: string,
  email: string,
  config: Record<string, unknown>
) => sendTestMessage(connectorFactoryId, 'email', email, config);

const sendTestMessage = async (
  connectorFactoryId: string,
  receiverType: 'phone' | 'email',
  receiver: string,
  config: Record<string, unknown>
) =>
  authedAdminApi.post({
    url: `connectors/${connectorFactoryId}/test`,
    json: { [receiverType]: receiver, config },
  });
