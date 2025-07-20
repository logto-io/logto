import type {
  Connector,
  ConnectorFactoryResponse,
  ConnectorResponse,
  CreateConnector,
} from '@logto/schemas';
import { type KyInstance } from 'ky';

import { authedAdminApi } from './api.js';

/**
 * We are using `id` and `connectorFactoryId` here:
 *
 * - `id` is used to identify connectors from the database.
 * - `connectorFactoryId` is used to identify connectors - more specifically, connector factories - in packages/connectors
 * that contain metadata (considered connectors' FIXED properties) and code implementation (which determines how connectors work).
 */

export const listConnectors = async (api: KyInstance = authedAdminApi) =>
  api.get('connectors').json<ConnectorResponse[]>();

export const getConnector = async (id: string, api: KyInstance = authedAdminApi) =>
  api.get(`connectors/${id}`).json<ConnectorResponse>();

export const listConnectorFactories = async (api: KyInstance = authedAdminApi) =>
  api.get('connector-factories').json<ConnectorFactoryResponse[]>();

export const getConnectorFactory = async (
  connectorFactoryId: string,
  api: KyInstance = authedAdminApi
) => api.get(`connector-factories/${connectorFactoryId}`).json<ConnectorFactoryResponse>();

export const postConnector = async (
  payload: Pick<CreateConnector, 'connectorId' | 'config' | 'metadata' | 'syncProfile'>,
  api: KyInstance = authedAdminApi
) =>
  api
    .post('connectors', {
      json: payload,
    })
    .json<Connector>();

export const deleteConnectorById = async (id: string, api: KyInstance = authedAdminApi) =>
  api.delete(`connectors/${id}`).json();

export const updateConnectorConfig = async (
  id: string,
  body: {
    config?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    enableTokenStorage?: boolean;
    syncProfile?: boolean;
  }
) =>
  authedAdminApi
    .patch(`connectors/${id}`, {
      json: body,
    })
    .json<ConnectorResponse>();

export const sendSmsTestMessage = async (
  connectorFactoryId: string,
  phone: string,
  config: Record<string, unknown>
) =>
  sendTestMessage({
    connectorFactoryId,
    receiverType: 'phone',
    receiver: phone,
    config,
  });

export const sendEmailTestMessage = async (
  connectorFactoryId: string,
  email: string,
  config: Record<string, unknown>,
  locale?: string
) =>
  sendTestMessage({
    connectorFactoryId,
    receiverType: 'email',
    receiver: email,
    config,
    locale,
  });

const sendTestMessage = async (options: {
  connectorFactoryId: string;
  receiverType: 'phone' | 'email';
  receiver: string;
  config: Record<string, unknown>;
  locale?: string;
}) =>
  authedAdminApi.post(`connectors/${options.connectorFactoryId}/test`, {
    json: {
      [options.receiverType]: options.receiver,
      config: options.config,
      locale: options.locale,
    },
  });

export const getConnectorAuthorizationUri = async (
  connectorId: string,
  state: string,
  redirectUri: string,
  api: KyInstance = authedAdminApi
) =>
  api
    .post(`connectors/${connectorId}/authorization-uri`, {
      json: { state, redirectUri },
    })
    .json<{ redirectTo: string }>();
