import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { type JsonObject } from '@logto/schemas';

export enum SsoConnectorErrorCodes {
  InvalidMetadata = 'invalid_metadata',
  InvalidConfig = 'invalid_config',
  SessionNotFound = 'session_not_found',
  InvalidResponse = 'invalid_response',
  AuthorizationFailed = 'authorization_failed',
  InvalidRequestParameters = 'invalid_request_parameters',
}

export enum SsoConnectorSessionErrorCodes {
  SessionNotFound = 'session_not_found',
}

export enum SsoConnectorConfigErrorCodes {
  InvalidConfigResponse = 'invalid_config_response',
  FailToFetchConfig = 'fail_to_fetch_config',
  InvalidConnectorConfig = 'invalid_connector_config',
}

const connectorErrorCodeMap: { [key in SsoConnectorErrorCodes]: ConnectorErrorCodes } = {
  [SsoConnectorErrorCodes.InvalidMetadata]: ConnectorErrorCodes.InvalidMetadata,
  [SsoConnectorErrorCodes.InvalidConfig]: ConnectorErrorCodes.InvalidConfig,
  [SsoConnectorErrorCodes.SessionNotFound]: ConnectorErrorCodes.NotImplemented,
  [SsoConnectorErrorCodes.InvalidResponse]: ConnectorErrorCodes.InvalidResponse,
  [SsoConnectorErrorCodes.InvalidRequestParameters]: ConnectorErrorCodes.InvalidRequestParameters,
  [SsoConnectorErrorCodes.AuthorizationFailed]: ConnectorErrorCodes.AuthorizationFailed,
};

export class SsoConnectorError extends ConnectorError {
  constructor(
    code: SsoConnectorErrorCodes.InvalidMetadata,
    data: { message: SsoConnectorConfigErrorCodes; metadata?: string | JsonObject; error?: unknown }
  );

  constructor(
    code: SsoConnectorErrorCodes.InvalidConfig,
    data: {
      message: SsoConnectorConfigErrorCodes;
      config: JsonObject | undefined;
      error?: unknown;
    }
  );

  constructor(
    code: SsoConnectorErrorCodes.InvalidRequestParameters,
    data: { url: string; params: unknown; error?: unknown }
  );

  constructor(
    code: SsoConnectorErrorCodes.InvalidResponse,
    data: {
      url: string;
      response: unknown;
      error?: unknown;
    }
  );

  constructor(
    code: SsoConnectorErrorCodes.SessionNotFound,
    data: { message: SsoConnectorSessionErrorCodes }
  );

  constructor(
    code: SsoConnectorErrorCodes.AuthorizationFailed,
    data: { message: string; response?: unknown; error?: unknown }
  );

  constructor(code: SsoConnectorErrorCodes, data?: unknown) {
    super(connectorErrorCodeMap[code], {
      ssoErrorCode: code,
      details: data,
    });
  }
}
