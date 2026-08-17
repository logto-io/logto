import { errors, type Provider } from 'oidc-provider';

import type Queries from '#src/tenants/Queries.js';

import { TokenExchangeTokenType } from './types.js';

const { jest } = import.meta;

const mockJwtVerify = jest.fn();

jest.unstable_mockModule('jose', () => ({
  jwtVerify: mockJwtVerify,
}));

const { validateSubjectToken } = await import('./account.js');

const { InvalidGrant } = errors;

const accountId = 'some_account_id';
const sourceClientId = 'some_source_client_id';

/** The JWT branch is only reached when the opaque lookup misses. */
const mockAccessToken = {
  find: async () => null,
} as unknown as Provider['AccessToken'];

const mockQueries = {
  subjectTokens: { findSubjectToken: jest.fn() },
  personalAccessTokens: { findByValue: jest.fn() },
} as unknown as Queries;

const validateJwtSubjectToken = async () =>
  validateSubjectToken({
    queries: mockQueries,
    subjectToken: 'some_jwt_token',
    subjectTokenType: TokenExchangeTokenType.AccessToken,
    AccessToken: mockAccessToken,
    jwtVerificationOptions: {
      localJWKSet: jest.fn() as never,
      issuer: 'https://logto.test/oidc',
    },
  });

describe('validateSubjectToken() JWT token class', () => {
  afterEach(() => {
    mockJwtVerify.mockReset();
  });

  it('should accept a JWT access token', async () => {
    mockJwtVerify.mockResolvedValueOnce({
      protectedHeader: { alg: 'ES384', typ: 'at+jwt' },
      payload: { sub: accountId, client_id: sourceClientId },
    });

    await expect(validateJwtSubjectToken()).resolves.toEqual({ userId: accountId });
  });

  it('should accept the `application/at+jwt` media type form', async () => {
    mockJwtVerify.mockResolvedValueOnce({
      protectedHeader: { alg: 'ES384', typ: 'application/at+jwt' },
      payload: { sub: accountId, client_id: sourceClientId },
    });

    await expect(validateJwtSubjectToken()).resolves.toEqual({ userId: accountId });
  });

  /**
   * An ID token is signed by the same keys under the same issuer, so signature verification alone
   * cannot separate it from an access token. Accepting one here would let an authentication-only
   * credential be converted into an API access token.
   */
  it('should reject a genuine ID token declared as an access token', async () => {
    mockJwtVerify.mockResolvedValueOnce({
      protectedHeader: { alg: 'ES384' },
      payload: { sub: accountId, aud: sourceClientId },
    });

    await expect(validateJwtSubjectToken()).rejects.toMatchError(
      new InvalidGrant('subject token is not an access token')
    );
  });

  it('should reject a JWT with a non access token `typ` header', async () => {
    mockJwtVerify.mockResolvedValueOnce({
      protectedHeader: { alg: 'ES384', typ: 'logout+jwt' },
      payload: { sub: accountId, client_id: sourceClientId },
    });

    await expect(validateJwtSubjectToken()).rejects.toMatchError(
      new InvalidGrant('subject token is not an access token')
    );
  });

  it('should reject a JWT with the access token `typ` but no `client_id` claim', async () => {
    mockJwtVerify.mockResolvedValueOnce({
      protectedHeader: { alg: 'ES384', typ: 'at+jwt' },
      payload: { sub: accountId },
    });

    await expect(validateJwtSubjectToken()).rejects.toMatchError(
      new InvalidGrant('subject token is not an access token')
    );
  });

  it('should reject a JWT that fails signature verification', async () => {
    mockJwtVerify.mockRejectedValueOnce(new Error('invalid signature'));

    await expect(validateJwtSubjectToken()).rejects.toMatchError(
      new InvalidGrant('invalid subject token')
    );
  });
});
