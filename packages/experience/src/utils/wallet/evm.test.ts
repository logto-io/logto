import { SiweConnector, toChecksumAddress } from '@logto/connector-kit';

import {
  discoverEvmWallets,
  parseSiweAuthorizationParams,
  signInWithEvmWallet,
  WalletError,
  type Eip1193Provider,
  type EvmWallet,
  type SiweAuthorizationParams,
} from './evm';

const accountAddress = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';
const signature = `0x${'ab'.repeat(65)}`;

const createAuthorizationUri = (overrides: Record<string, string> = {}) => {
  const { authorizationParams, authorizationUriScheme } = SiweConnector;
  const url = new URL(`${authorizationUriScheme}://authorize`);
  const params = {
    [authorizationParams.domain]: 'example.logto.app',
    [authorizationParams.uri]: 'https://example.logto.app',
    [authorizationParams.nonce]: 'abcdef0123456789',
    [authorizationParams.issuedAt]: '2026-01-01T00:00:00.000Z',
    [authorizationParams.expirationTime]: '2026-01-01T00:10:00.000Z',
    [authorizationParams.chainIds]: '1,137',
    [authorizationParams.statement]: 'Sign in to Logto',
    ...overrides,
  };

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return url.toString();
};

const createProvider = (request: jest.Mock): Eip1193Provider => ({ request });

const createWallet = (request: jest.Mock): EvmWallet => ({
  id: 'test-wallet',
  name: 'Test Wallet',
  provider: createProvider(request),
});

const baseParams: SiweAuthorizationParams = {
  domain: 'example.logto.app',
  uri: 'https://example.logto.app',
  nonce: 'abcdef0123456789',
  issuedAt: '2026-01-01T00:00:00.000Z',
  expirationTime: '2026-01-01T00:10:00.000Z',
  chainIds: [1, 137],
  statement: 'Sign in to Logto',
};

describe('parseSiweAuthorizationParams', () => {
  it('parses all SIWE parameters from the authorization URI', () => {
    expect(parseSiweAuthorizationParams(createAuthorizationUri())).toEqual(baseParams);
  });

  it('rejects a missing parameter', () => {
    const url = new URL(createAuthorizationUri());
    url.searchParams.delete(SiweConnector.authorizationParams.nonce);

    expect(() => parseSiweAuthorizationParams(url.toString())).toThrow(WalletError);
  });

  it('rejects an unexpected scheme', () => {
    expect(() =>
      parseSiweAuthorizationParams(createAuthorizationUri().replace('siwe:', 'https:'))
    ).toThrow(WalletError);
  });

  it('rejects an invalid chain ID list', () => {
    expect(() =>
      parseSiweAuthorizationParams(
        createAuthorizationUri({ [SiweConnector.authorizationParams.chainIds]: '1,foo' })
      )
    ).toThrow(WalletError);
  });
});

describe('discoverEvmWallets', () => {
  afterEach(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- restore the global test environment
    window.ethereum = undefined;
  });

  it('discovers wallets announced through EIP-6963', async () => {
    const provider = createProvider(jest.fn());
    const handleRequest = () => {
      window.dispatchEvent(
        new CustomEvent('eip6963:announceProvider', {
          detail: {
            info: {
              uuid: 'wallet-1',
              name: 'Wallet One',
              icon: 'data:image/svg+xml,foo',
              rdns: 'one',
            },
            provider,
          },
        })
      );
    };

    window.addEventListener('eip6963:requestProvider', handleRequest);

    const wallets = await discoverEvmWallets();

    window.removeEventListener('eip6963:requestProvider', handleRequest);

    expect(wallets).toEqual([
      {
        id: 'wallet-1',
        name: 'Wallet One',
        icon: 'data:image/svg+xml,foo',
        provider,
      },
    ]);
  });

  it('falls back to window.ethereum when no EIP-6963 wallet is announced', async () => {
    const provider = createProvider(jest.fn());
    // eslint-disable-next-line @silverhand/fp/no-mutation -- install the injected provider for the test
    window.ethereum = provider;

    await expect(discoverEvmWallets()).resolves.toEqual([
      {
        id: 'injected',
        name: 'Browser wallet',
        icon: undefined,
        provider,
      },
    ]);
  });

  it('returns an empty list when no wallet is available', async () => {
    await expect(discoverEvmWallets()).resolves.toEqual([]);
  });
});

describe('signInWithEvmWallet', () => {
  it('checksums the address and signs the SIWE message', async () => {
    const request = jest
      .fn()
      .mockResolvedValueOnce([accountAddress.toLowerCase()])
      .mockResolvedValueOnce('0x1')
      .mockResolvedValueOnce(signature);

    const result = await signInWithEvmWallet(createWallet(request), baseParams);

    expect(result.signature).toBe(signature);
    expect(result.message).toContain(`\n${accountAddress}\n`);
    expect(result.message).toContain('Chain ID: 1');
    expect(result.message).toContain('Nonce: abcdef0123456789');
    expect(request).toHaveBeenNthCalledWith(1, { method: 'eth_requestAccounts' });
    expect(request).toHaveBeenNthCalledWith(3, {
      method: 'personal_sign',
      params: [result.message, accountAddress],
    });
  });

  it('switches to the first allowed chain when the wallet is on another chain', async () => {
    const request = jest
      .fn()
      .mockResolvedValueOnce([accountAddress])
      .mockResolvedValueOnce('0x89')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('0x1')
      .mockResolvedValueOnce(signature);

    const result = await signInWithEvmWallet(createWallet(request), {
      ...baseParams,
      chainIds: [1],
    });

    expect(result.message).toContain('Chain ID: 1');
    expect(request).toHaveBeenNthCalledWith(3, {
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x1' }],
    });
  });

  it('maps a rejected request to a rejected wallet error', async () => {
    const request = jest.fn().mockRejectedValue({ code: 4001 });

    await expect(signInWithEvmWallet(createWallet(request), baseParams)).rejects.toMatchObject({
      code: 'rejected',
    });
  });

  it('maps an unknown chain to an unsupported chain error', async () => {
    const request = jest
      .fn()
      .mockResolvedValueOnce([accountAddress])
      .mockResolvedValueOnce('0x89')
      .mockRejectedValueOnce({ code: 4902 });

    await expect(signInWithEvmWallet(createWallet(request), baseParams)).rejects.toMatchObject({
      code: 'unsupported_chain',
    });
  });

  it('rejects a wallet that returns no account', async () => {
    const request = jest.fn().mockResolvedValueOnce([]);

    await expect(signInWithEvmWallet(createWallet(request), baseParams)).rejects.toMatchObject({
      code: 'unknown',
    });
  });

  it('rejects an invalid signature', async () => {
    const request = jest
      .fn()
      .mockResolvedValueOnce([accountAddress])
      .mockResolvedValueOnce('0x1')
      .mockResolvedValueOnce('not-a-signature');

    await expect(signInWithEvmWallet(createWallet(request), baseParams)).rejects.toMatchObject({
      code: 'unknown',
    });
  });

  it('returns a checksummed address in the signed message', async () => {
    const request = jest
      .fn()
      .mockResolvedValueOnce([accountAddress.toLowerCase()])
      .mockResolvedValueOnce('0x1')
      .mockResolvedValueOnce(signature);

    const result = await signInWithEvmWallet(createWallet(request), baseParams);

    expect(result.message).toContain(toChecksumAddress(accountAddress));
  });
});
