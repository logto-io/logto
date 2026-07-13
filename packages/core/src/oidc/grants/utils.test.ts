import { type Provider, errors } from 'oidc-provider';

import { createOidcContext } from '#src/test-utils/oidc-provider.js';

const { jest } = import.meta;

const { InvalidGrant, InvalidClient } = errors;

const dpopValidate = jest.fn();

jest.unstable_mockModule('#src/oidc/oidc-provider-internals.js', () => ({
  certificateThumbprint: jest.fn(),
  dpopValidate,
  epochTime: () => Math.floor(Date.now() / 1000),
  getProviderConfiguration: jest.fn(),
}));

const { handleDPoP } = await import('./utils.js');

type AccessToken = InstanceType<Provider['AccessToken']>;
type RefreshToken = InstanceType<Provider['RefreshToken']>;
type Client = InstanceType<Provider['Client']>;

const clientId = 'some_client_id';
const thumbprint = 'dpop_key_thumbprint';

const createClient = (dpopBoundAccessTokens = false): Client =>
  // @ts-expect-error -- mock the minimal client shape used by `handleDPoP`
  ({ clientId, dpopBoundAccessTokens });

const createToken = () => {
  const setThumbprint = jest.fn();
  // @ts-expect-error -- `setThumbprint` exists at runtime but is not declared in the typings
  const token: AccessToken = { setThumbprint };
  return { token, setThumbprint };
};

/**
 * `handleDPoP` resolves the `ReplayDetection` model from the real provider instance created by
 * `createOidcContext()`, backed by the default memory adapter, so these tests exercise the actual
 * static `unique()` call and its replay semantics rather than a stubbed model.
 */
describe('handleDPoP', () => {
  afterEach(() => {
    dpopValidate.mockReset();
  });

  it('should throw when the client is not available', async () => {
    const ctx = createOidcContext();
    const { token } = createToken();

    await expect(handleDPoP(ctx, token)).rejects.toMatchError(
      new InvalidClient('client must be available')
    );
  });

  it('should do nothing when no DPoP proof is provided', async () => {
    const ctx = createOidcContext({ client: createClient() });
    const { token, setThumbprint } = createToken();

    await expect(handleDPoP(ctx, token)).resolves.toBeUndefined();
    expect(setThumbprint).not.toHaveBeenCalled();
  });

  it('should throw when the client requires DPoP but no proof is provided', async () => {
    const ctx = createOidcContext({ client: createClient(true) });
    const { token } = createToken();

    await expect(handleDPoP(ctx, token)).rejects.toMatchError(
      new InvalidGrant('DPoP proof JWT not provided')
    );
  });

  it('should bind the proof thumbprint to the token when a DPoP proof is provided', async () => {
    dpopValidate.mockResolvedValue({ thumbprint, jti: 'dpop_jti_bind', iat: 1000 });
    const ctx = createOidcContext({ client: createClient() });
    const { token, setThumbprint } = createToken();

    await expect(handleDPoP(ctx, token)).resolves.toBeUndefined();
    expect(setThumbprint).toHaveBeenCalledWith('jkt', thumbprint);
  });

  it('should detect a replayed DPoP proof', async () => {
    dpopValidate.mockResolvedValue({ thumbprint, jti: 'dpop_jti_replay', iat: 1000 });
    const ctx = createOidcContext({ client: createClient() });

    await expect(handleDPoP(ctx, createToken().token)).resolves.toBeUndefined();
    await expect(handleDPoP(ctx, createToken().token)).rejects.toMatchError(
      new InvalidGrant('DPoP proof JWT Replay detected')
    );
  });

  it('should throw when the original token is bound to another key', async () => {
    dpopValidate.mockResolvedValue({ thumbprint, jti: 'dpop_jti_mismatch', iat: 1000 });
    const ctx = createOidcContext({ client: createClient() });
    // @ts-expect-error -- mock the minimal refresh token shape used by `handleDPoP`
    const originalToken: RefreshToken = { jkt: 'another_key_thumbprint' };

    await expect(handleDPoP(ctx, createToken().token, originalToken)).rejects.toMatchError(
      new InvalidGrant('failed jkt verification')
    );
  });

  it('should throw when the original token is DPoP-bound but no proof is provided', async () => {
    const ctx = createOidcContext({ client: createClient() });
    // @ts-expect-error -- mock the minimal refresh token shape used by `handleDPoP`
    const originalToken: RefreshToken = { jkt: thumbprint };

    await expect(handleDPoP(ctx, createToken().token, originalToken)).rejects.toMatchError(
      new InvalidGrant('failed jkt verification')
    );
  });

  it('should pass when the original token is bound to the same key', async () => {
    dpopValidate.mockResolvedValue({ thumbprint, jti: 'dpop_jti_match', iat: 1000 });
    const ctx = createOidcContext({ client: createClient() });
    // @ts-expect-error -- mock the minimal refresh token shape used by `handleDPoP`
    const originalToken: RefreshToken = { jkt: thumbprint };
    const { token, setThumbprint } = createToken();

    await expect(handleDPoP(ctx, token, originalToken)).resolves.toBeUndefined();
    expect(setThumbprint).toHaveBeenCalledWith('jkt', thumbprint);
  });
});
