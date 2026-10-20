import type { ConnectorSession } from '@logto/connector-kit';
import {
  ConnectorErrorCodes,
  createSiweMessage,
  SiweConnector,
  toChecksumAddress,
} from '@logto/connector-kit';
import { privateKeyToAccount } from 'viem/accounts';

import { defaultChainIds, nonceTtlSeconds } from './constant.js';
import createConnector, { parseChainIds } from './index.js';
import type { SiweSession } from './types.js';

const privateKey = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const account = privateKeyToAccount(privateKey);
const otherAccount = privateKeyToAccount(
  '0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789'
);

const redirectUri = 'https://example.logto.app/callback/siwe';
const connectorPayload = {
  state: 'some_state',
  redirectUri,
  connectorId: 'some_connector_id',
  connectorFactoryId: SiweConnector.factoryId,
  jti: 'some_jti',
  headers: {},
};

const createTestConnector = async (config: { statement?: string; chainIds?: string } = {}) => {
  const getConfig = vi.fn().mockResolvedValue(config);
  return createConnector({ getConfig });
};

const getAuthorizationParams = async (
  connector: Awaited<ReturnType<typeof createTestConnector>>
) => {
  const sessions: ConnectorSession[] = [];

  const authorizationUri = await connector.getAuthorizationUri(
    connectorPayload,
    async (session) => {
      // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- capture the session for assertions
      sessions.push(session);
    }
  );

  const url = new URL(authorizationUri);
  const session = sessions[0] as SiweSession | undefined;

  if (!session) {
    throw new Error('The connector did not store a session');
  }

  return { url, session };
};

const createSessionReader = (session: SiweSession) => {
  const sessions = [session];

  // Mimic core's one-time connector session: reading it removes it from the interaction result.
  const getSession = vi.fn(async (): Promise<ConnectorSession> => {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- consume the one-time session like core
    const value = sessions.shift();

    if (!value) {
      throw new Error('Connector session not found');
    }

    return value;
  });

  return getSession;
};

const buildMessage = (
  session: SiweSession,
  overrides: Partial<Parameters<typeof createSiweMessage>[0]> = {}
) =>
  createSiweMessage({
    domain: session.domain,
    address: account.address,
    uri: session.uri,
    nonce: session.nonce,
    issuedAt: session.issuedAt,
    expirationTime: session.expirationTime,
    chainId: 1,
    statement: session.statement,
    ...overrides,
  });

describe('getAuthorizationUri', () => {
  it('stores a one-time nonce and returns the SIWE message parameters', async () => {
    const connector = await createTestConnector({
      chainIds: '1, 137',
      statement: 'Sign in to Logto',
    });
    const { url, session } = await getAuthorizationParams(connector);

    expect(url.protocol).toBe(`${SiweConnector.authorizationUriScheme}:`);
    expect(url.searchParams.get(SiweConnector.authorizationParams.domain)).toBe(
      'example.logto.app'
    );
    expect(url.searchParams.get(SiweConnector.authorizationParams.uri)).toBe(
      'https://example.logto.app'
    );
    expect(url.searchParams.get(SiweConnector.authorizationParams.nonce)).toMatch(/^[\da-f]{32}$/);
    expect(url.searchParams.get(SiweConnector.authorizationParams.chainIds)).toBe('1,137');
    expect(url.searchParams.get(SiweConnector.authorizationParams.statement)).toBe(
      'Sign in to Logto'
    );

    expect(session).toMatchObject({
      domain: 'example.logto.app',
      uri: 'https://example.logto.app',
      chainIds: [1, 137],
      statement: 'Sign in to Logto',
    });
    expect(new Date(session.expirationTime).getTime()).toBe(
      new Date(session.issuedAt).getTime() + nonceTtlSeconds * 1000
    );
  });

  it('uses the custom domain and port from the redirect URI', async () => {
    const connector = await createTestConnector();
    const sessions: ConnectorSession[] = [];

    await connector.getAuthorizationUri(
      { ...connectorPayload, redirectUri: 'https://login.example.com:8443/callback/siwe' },
      async (session) => {
        // eslint-disable-next-line @silverhand/fp/no-mutating-methods -- capture the session for assertions
        sessions.push(session);
      }
    );

    expect(sessions[0]).toMatchObject({
      domain: 'login.example.com:8443',
      uri: 'https://login.example.com:8443',
    });
  });

  it('collapses newlines in the configured statement', async () => {
    const connector = await createTestConnector({ statement: '  Sign in\nto Logto  ' });
    const { session } = await getAuthorizationParams(connector);

    expect(session.statement).toBe('Sign in to Logto');
  });

  it('falls back to the default chain list for an empty config', async () => {
    const connector = await createTestConnector();
    const { session } = await getAuthorizationParams(connector);

    expect(session.chainIds).toEqual(defaultChainIds);
  });
});

describe('parseChainIds', () => {
  it('parses comma and whitespace separated chain IDs and deduplicates them', () => {
    expect(parseChainIds(' 1,137 56,1 ')).toEqual([1, 137, 56]);
  });

  it('returns the default list for an empty value', () => {
    expect(parseChainIds()).toEqual(defaultChainIds);
    expect(parseChainIds('  ')).toEqual(defaultChainIds);
  });

  it('rejects invalid chain IDs', () => {
    expect(() => parseChainIds('1, mainnet')).toThrow();
    expect(() => parseChainIds('0')).toThrow();
    expect(() => parseChainIds('-1')).toThrow();
  });
});

describe('getUserInfo', () => {
  it('returns a checksummed address and the chain ID in raw data', async () => {
    const connector = await createTestConnector({ chainIds: '1, 137' });
    const { session } = await getAuthorizationParams(connector);
    const message = buildMessage(session);
    const signature = await account.signMessage({ message });

    const userInfo = await connector.getUserInfo(
      { message, signature },
      createSessionReader(session)
    );

    expect(userInfo).toStrictEqual({
      id: toChecksumAddress(account.address),
      rawData: {
        address: toChecksumAddress(account.address),
        chainId: 1,
      },
    });
  });

  it('keeps the same identity across allowed chains', async () => {
    const connector = await createTestConnector({ chainIds: '1, 137' });
    const { session } = await getAuthorizationParams(connector);
    const message = buildMessage(session, { chainId: 137 });
    const signature = await account.signMessage({ message });

    const userInfo = await connector.getUserInfo(
      { message, signature },
      createSessionReader(session)
    );

    expect(userInfo.id).toBe(toChecksumAddress(account.address));
    expect(userInfo.rawData).toMatchObject({ chainId: 137 });
  });

  it('normalizes a lowercase address to EIP-55', async () => {
    const connector = await createTestConnector();
    const { session } = await getAuthorizationParams(connector);
    const message = buildMessage(session, { address: account.address.toLowerCase() });
    const signature = await account.signMessage({ message });

    const userInfo = await connector.getUserInfo(
      { message, signature },
      createSessionReader(session)
    );

    expect(userInfo.id).toBe(toChecksumAddress(account.address));
    expect(userInfo.id).not.toBe(account.address.toLowerCase());
  });

  it('rejects a signature from another account', async () => {
    const connector = await createTestConnector();
    const { session } = await getAuthorizationParams(connector);
    const message = buildMessage(session);
    const signature = await otherAccount.signMessage({ message });

    await expect(
      connector.getUserInfo({ message, signature }, createSessionReader(session))
    ).rejects.toMatchObject({ code: ConnectorErrorCodes.InvalidResponse });
  });

  it('rejects a nonce mismatch', async () => {
    const connector = await createTestConnector();
    const { session } = await getAuthorizationParams(connector);
    const message = buildMessage(session, { nonce: 'ffffffffffffffff' });
    const signature = await account.signMessage({ message });

    await expect(
      connector.getUserInfo({ message, signature }, createSessionReader(session))
    ).rejects.toMatchObject({ code: ConnectorErrorCodes.InvalidResponse });
  });

  it('rejects a replayed message after the session is consumed', async () => {
    const connector = await createTestConnector();
    const { session } = await getAuthorizationParams(connector);
    const message = buildMessage(session);
    const signature = await account.signMessage({ message });
    const getSession = createSessionReader(session);

    await expect(connector.getUserInfo({ message, signature }, getSession)).resolves.toBeDefined();
    await expect(connector.getUserInfo({ message, signature }, getSession)).rejects.toThrow(
      'Connector session not found'
    );
  });

  it('rejects a domain mismatch', async () => {
    const connector = await createTestConnector();
    const { session } = await getAuthorizationParams(connector);
    const message = buildMessage(session, { domain: 'evil.example.com' });
    const signature = await account.signMessage({ message });

    await expect(
      connector.getUserInfo({ message, signature }, createSessionReader(session))
    ).rejects.toMatchObject({ code: ConnectorErrorCodes.InvalidResponse });
  });

  it('rejects a URI mismatch', async () => {
    const connector = await createTestConnector();
    const { session } = await getAuthorizationParams(connector);
    const message = buildMessage(session, { uri: 'https://evil.example.com' });
    const signature = await account.signMessage({ message });

    await expect(
      connector.getUserInfo({ message, signature }, createSessionReader(session))
    ).rejects.toMatchObject({ code: ConnectorErrorCodes.InvalidResponse });
  });

  it('rejects an expired message', async () => {
    const connector = await createTestConnector();
    const { session } = await getAuthorizationParams(connector);
    const expiredSession: SiweSession = {
      ...session,
      issuedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      expirationTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    };
    const message = buildMessage(expiredSession);
    const signature = await account.signMessage({ message });

    await expect(
      connector.getUserInfo({ message, signature }, createSessionReader(expiredSession))
    ).rejects.toMatchObject({ code: ConnectorErrorCodes.InvalidResponse });
  });

  it('rejects a chain ID outside the allow-list', async () => {
    const connector = await createTestConnector({ chainIds: '1' });
    const { session } = await getAuthorizationParams(connector);
    const message = buildMessage(session, { chainId: 5 });
    const signature = await account.signMessage({ message });

    await expect(
      connector.getUserInfo({ message, signature }, createSessionReader(session))
    ).rejects.toMatchObject({ code: ConnectorErrorCodes.InvalidResponse });
  });

  it('rejects a statement mismatch', async () => {
    const connector = await createTestConnector({ statement: 'Sign in to Logto' });
    const { session } = await getAuthorizationParams(connector);
    const message = buildMessage(session, { statement: 'Sign in to another app' });
    const signature = await account.signMessage({ message });

    await expect(
      connector.getUserInfo({ message, signature }, createSessionReader(session))
    ).rejects.toMatchObject({ code: ConnectorErrorCodes.InvalidResponse });
  });

  it('rejects malformed callback data', async () => {
    const connector = await createTestConnector();
    const { session } = await getAuthorizationParams(connector);

    await expect(
      connector.getUserInfo({ message: '', signature: '0x' }, createSessionReader(session))
    ).rejects.toMatchObject({ code: ConnectorErrorCodes.InvalidRequestParameters });
    await expect(
      connector.getUserInfo({ message: buildMessage(session) }, createSessionReader(session))
    ).rejects.toMatchObject({ code: ConnectorErrorCodes.InvalidRequestParameters });
  });

  it('rejects a malformed message', async () => {
    const connector = await createTestConnector();
    const { session } = await getAuthorizationParams(connector);

    await expect(
      connector.getUserInfo(
        { message: 'not a siwe message', signature: '0x' },
        createSessionReader(session)
      )
    ).rejects.toMatchObject({ code: ConnectorErrorCodes.InvalidResponse });
  });

  it('rejects a missing connector session', async () => {
    const connector = await createTestConnector();
    const { session } = await getAuthorizationParams(connector);
    const message = buildMessage(session);
    const signature = await account.signMessage({ message });

    await expect(
      connector.getUserInfo({ message, signature }, async () => {
        throw new Error('Connector session not found');
      })
    ).rejects.toThrow('Connector session not found');
  });
});
