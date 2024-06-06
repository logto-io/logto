export const mockConfig = {
  scope: 'openid profile email',
  authorizationEndpoint: 'http://authorization.endpoint.io/auth',
  tokenEndpoint: 'http://token.endpoint.io/auth',
  clientId: 'client-id',
  clientSecret: 'client-secret',
  idTokenVerificationConfig: { jwksUri: 'http://jwks.uri.io/id_token' },
};
