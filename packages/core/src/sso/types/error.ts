import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { type JsonObject } from '@logto/schemas';

export enum SsoConnectorErrorCodes {
  InvalidMetadata = 'invalid_metadata',
  InvalidConfig = 'invalid_config',
  InvalidCertificate = 'invalid_certificate',
  AuthorizationFailed = 'authorization_failed',
  InvalidResponse = 'invalid_response',
  InvalidRequestParameters = 'invalid_request_parameters',
}

export enum SsoConnectorConfigErrorCodes {
  InvalidSamlXmlMetadata = 'invalid_saml_xml_metadata',
  InvalidConfigResponse = 'invalid_config_response',
  FailToFetchConfig = 'fail_to_fetch_config',
  InvalidConnectorConfig = 'invalid_connector_config',
}

const connectorErrorCodeMap: { [key in SsoConnectorErrorCodes]: ConnectorErrorCodes } = {
  [SsoConnectorErrorCodes.InvalidMetadata]: ConnectorErrorCodes.InvalidMetadata,
  [SsoConnectorErrorCodes.InvalidConfig]: ConnectorErrorCodes.InvalidConfig,
  [SsoConnectorErrorCodes.InvalidCertificate]: ConnectorErrorCodes.InvalidCertificate,
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
    code: SsoConnectorErrorCodes.InvalidCertificate,
    data: {
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
    code: SsoConnectorErrorCodes.AuthorizationFailed,
    data: { message: string; response?: unknown; error?: unknown }
  );

  constructor(code: SsoConnectorErrorCodes, data?: Record<string, unknown>) {
    super(connectorErrorCodeMap[code], {
      ssoErrorCode: code,
      ...data,
    });
  }
}
