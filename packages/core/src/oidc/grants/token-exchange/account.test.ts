import { errors, type Provider } from 'oidc-provider';

import { mockApplication } from '#src/__mocks__/index.js';
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

const findApplicationById = jest.fn(async (id: string) => ({
  ...mockApplication,
  id,
  isThirdParty: false,
}));

const mockQueries = {
  subjectTokens: { findSubjectToken: jest.fn() },
  personalAccessTokens: { findByValue: jest.fn() },
  applications: { findApplicationById },
} as unknown as Queries;

/** The JWT branch is only reached when the opaque lookup misses. */
const mockNoOpaqueToken = {
  find: async () => null,
} as unknown as Provider['AccessToken'];

const mockOpaqueToken = (token: Record<string, unknown>) =>
  ({ find: async () => token }) as unknown as Provider['AccessToken'];

const validateAccessTokenSubject = async (AccessToken = mockNoOpaqueToken) =>
  validateSubjectToken({
    queries: mockQueries,
    subjectToken: 'some_jwt_token',
    subjectTokenType: TokenExchangeTokenType.AccessToken,
    AccessToken,
    jwtVerificationOptions: {
      localJWKSet: jest.fn() as never,
      issuer: 'https://logto.test/oidc',
    },
  });

const validateJwtSubjectToken = async () => validateAccessTokenSubject();

describe('validateSubjectToken() JWT token class', () => {
  afterEach(() => {
    mockJwtVerify.mockReset();
    findApplicationById.mockClear();
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

describe('validateSubjectToken() subject token client', () => {
  const notFirstParty = new InvalidGrant(
    'subject token was not issued to a first-party application'
  );

  afterEach(() => {
    mockJwtVerify.mockReset();
    findApplicationById.mockClear();
  });

  it('should accept an opaque access token issued to a first-party application', async () => {
    const AccessToken = mockOpaqueToken({
      accountId,
      clientId: sourceClientId,
      isExpired: false,
    });

    await expect(validateAccessTokenSubject(AccessToken)).resolves.toEqual({ userId: accountId });
    expect(findApplicationById).toHaveBeenCalledWith(sourceClientId);
  });

  it('should reject an opaque access token issued to a third-party application', async () => {
    findApplicationById.mockResolvedValueOnce({
      ...mockApplication,
      id: sourceClientId,
      isThirdParty: true,
    });
    const AccessToken = mockOpaqueToken({
      accountId,
      clientId: sourceClientId,
      isExpired: false,
    });

    await expect(validateAccessTokenSubject(AccessToken)).rejects.toMatchError(notFirstParty);
  });

  it('should reject a JWT access token issued to a third-party application', async () => {
    findApplicationById.mockResolvedValueOnce({
      ...mockApplication,
      id: sourceClientId,
      isThirdParty: true,
    });
    mockJwtVerify.mockResolvedValueOnce({
      protectedHeader: { alg: 'ES384', typ: 'at+jwt' },
      payload: { sub: accountId, client_id: sourceClientId },
    });

    await expect(validateJwtSubjectToken()).rejects.toMatchError(notFirstParty);
  });

  it('should reject when the issuing client cannot be resolved', async () => {
    findApplicationById.mockRejectedValueOnce(new Error('not found'));
    mockJwtVerify.mockResolvedValueOnce({
      protectedHeader: { alg: 'ES384', typ: 'at+jwt' },
      payload: { sub: accountId, client_id: sourceClientId },
    });

    await expect(validateJwtSubjectToken()).rejects.toMatchError(notFirstParty);
  });

  it('should reject an opaque access token with no client binding', async () => {
    const AccessToken = mockOpaqueToken({ accountId, isExpired: false });

    await expect(validateAccessTokenSubject(AccessToken)).rejects.toMatchError(
      new InvalidGrant('invalid subject token')
    );
  });
});
