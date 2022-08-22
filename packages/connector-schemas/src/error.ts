export enum ConnectorErrorCodes {
  General,
  InsufficientRequestParameters,
  InvalidConfig,
  InvalidResponse,
  TemplateNotFound,
  NotImplemented,
  SocialAuthCodeInvalid,
  SocialAccessTokenInvalid,
  SocialIdTokenInvalid,
  AuthorizationFailed,
}

export class ConnectorError extends Error {
  public code: ConnectorErrorCodes;
  public data: unknown;

  constructor(code: ConnectorErrorCodes, payload?: { message?: string; data?: unknown }) {
    const { message, data } = payload ?? {};
    super(message ?? 'Connector error occurred.');
    this.code = code;
    this.data = payload ?? {};
  }
}
