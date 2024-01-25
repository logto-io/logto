export enum ConnectorErrorCodes {
  General = 'general',
  InvalidMetadata = 'invalid_metadata',
  UnexpectedType = 'unexpected_type',
  InvalidConfigGuard = 'invalid_config_guard',
  InvalidRequestParameters = 'invalid_request_parameters',
  InsufficientRequestParameters = 'insufficient_request_parameters',
  InvalidConfig = 'invalid_config',
  InvalidCertificate = 'invalid_certificate',
  InvalidResponse = 'invalid_response',
  /** The template is not found for the given type. */
  TemplateNotFound = 'template_not_found',
  /**
   * The template type is not supported by the connector.
   *
   * @deprecated Connector should be able to handle dynamic template type.
   */
  TemplateNotSupported = 'template_not_supported',
  RateLimitExceeded = 'rate_limit_exceeded',
  NotImplemented = 'not_implemented',
  SocialAuthCodeInvalid = 'social_auth_code_invalid',
  SocialAccessTokenInvalid = 'social_invalid_access_token',
  SocialIdTokenInvalid = 'social_invalid_id_token',
  AuthorizationFailed = 'authorization_failed',
}

export class ConnectorError extends Error {
  public code: ConnectorErrorCodes;
  public data: unknown;

  constructor(code: ConnectorErrorCodes, data?: unknown) {
    const message = `ConnectorError: ${data ? JSON.stringify(data) : code}`;
    super(message);
    this.code = code;
    this.data = typeof data === 'string' ? { message: data } : data;
  }
}
