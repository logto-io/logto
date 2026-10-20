import { randomBytes } from 'node:crypto';

import type {
  CreateConnector,
  GetAuthorizationUri,
  GetConnectorConfig,
  GetUserInfo,
  SocialConnector,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorType,
  SiweConnector,
  toChecksumAddress,
  validateConfig,
} from '@logto/connector-kit';
import { ParsedMessage } from '@spruceid/siwe-parser';
import { isHex, recoverMessageAddress } from 'viem';

import { defaultChainIds, defaultMetadata, defaultStatement, nonceTtlSeconds } from './constant.js';
import {
  siweCallbackDataGuard,
  siweConfigGuard,
  siweSessionGuard,
  type SiweSession,
} from './types.js';

/**
 * Parse the comma/whitespace separated chain ID list from the connector config.
 *
 * An empty value falls back to {@link defaultChainIds}. Invalid values fail the request instead
 * of being silently ignored, so a typo cannot accidentally widen or narrow the allow-list.
 */
export const parseChainIds = (value?: string): number[] => {
  const tokens = (value ?? '').split(/[\s,]+/).filter(Boolean);

  if (tokens.length === 0) {
    return [...defaultChainIds];
  }

  const chainIds = tokens.map((token) => {
    if (!/^\d+$/.test(token)) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, {
        errorDescription: `Invalid EVM chain ID: ${token}`,
      });
    }

    const chainId = Number(token);

    if (!Number.isSafeInteger(chainId) || chainId <= 0) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, {
        errorDescription: `Invalid EVM chain ID: ${token}`,
      });
    }

    return chainId;
  });

  return [...new Set(chainIds)];
};

const parseRedirectUri = (redirectUri: string) => {
  try {
    const url = new URL(redirectUri);

    if (url.protocol === 'http:' || url.protocol === 'https:') {
      // `host` includes a non-default port, which is part of the SIWE domain. `origin` is the
      // resource URI users are signing in to.
      return { domain: url.host, uri: url.origin };
    }
  } catch {
    // Fall through to the connector error below.
  }

  throw new ConnectorError(ConnectorErrorCodes.InvalidRequestParameters, {
    errorDescription: `Invalid redirect URI: ${redirectUri}`,
  });
};

const invalidMessage = (reason: string) =>
  new ConnectorError(ConnectorErrorCodes.InvalidResponse, { errorDescription: reason });

/**
 * Normalize the address line of a SIWE message to EIP-55 before parsing.
 *
 * The signature is still verified against the original message, so normalizing the copy used
 * for field validation only affects casing. This keeps wallets that return lowercase addresses
 * working while ensuring the stored identity is always canonical.
 */
const normalizeMessageAddress = (rawMessage: string) => {
  const lines = rawMessage.split('\n');
  const address = lines[1];

  if (!address || !/^0x[\dA-Fa-f]{40}$/.test(address)) {
    throw invalidMessage('Invalid wallet address');
  }

  const checksumAddress = toChecksumAddress(address);
  const normalizedMessage = [lines[0], checksumAddress, ...lines.slice(2)].join('\n');

  return { normalizedMessage, checksumAddress };
};

const parseMessage = (normalizedMessage: string): ParsedMessage => {
  try {
    return new ParsedMessage(normalizedMessage);
  } catch {
    throw invalidMessage('Invalid SIWE message');
  }
};

const validateMessageTarget = (message: ParsedMessage, session: SiweSession) => {
  // Domain names are case-insensitive; the URI is compared exactly to prevent a signed message
  // from being replayed on a different origin.
  if (message.domain.toLowerCase() !== session.domain.toLowerCase()) {
    throw invalidMessage('SIWE domain mismatch');
  }

  if (message.uri !== session.uri) {
    throw invalidMessage('SIWE URI mismatch');
  }

  if (message.nonce !== session.nonce) {
    throw invalidMessage('SIWE nonce mismatch');
  }

  if (!session.chainIds.includes(message.chainId)) {
    throw invalidMessage(`Unsupported EVM chain ID: ${message.chainId}`);
  }

  if (message.statement !== session.statement) {
    throw invalidMessage('SIWE statement mismatch');
  }
};

const validateMessageTime = (message: ParsedMessage, session: SiweSession) => {
  if (message.issuedAt !== session.issuedAt) {
    throw invalidMessage('SIWE issued-at mismatch');
  }

  if (message.expirationTime !== session.expirationTime) {
    throw invalidMessage('SIWE expiration mismatch');
  }

  const expiration = Date.parse(session.expirationTime);

  if (Number.isNaN(expiration) || Date.now() >= expiration) {
    throw invalidMessage('SIWE message expired');
  }

  if (message.notBefore && Date.parse(message.notBefore) > Date.now()) {
    throw invalidMessage('SIWE message is not valid yet');
  }
};

const validateMessage = (message: ParsedMessage, session: SiweSession) => {
  if (message.version !== '1') {
    throw invalidMessage('Unsupported SIWE version');
  }

  validateMessageTarget(message, session);
  validateMessageTime(message, session);
};

const getAuthorizationUri =
  (getConfig: GetConnectorConfig): GetAuthorizationUri =>
  async ({ redirectUri }, setSession) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, siweConfigGuard);

    const { domain, uri } = parseRedirectUri(redirectUri);
    const chainIds = parseChainIds(config.chainIds);
    const issuedAt = new Date();
    const expirationTime = new Date(issuedAt.getTime() + nonceTtlSeconds * 1000);
    const configuredStatement = config.statement?.replace(/\r?\n/g, ' ').trim();
    const statement = configuredStatement?.length ? configuredStatement : defaultStatement;

    const session: SiweSession = {
      nonce: randomBytes(16).toString('hex'),
      domain,
      uri,
      issuedAt: issuedAt.toISOString(),
      expirationTime: expirationTime.toISOString(),
      chainIds,
      statement,
    };

    await setSession(session);

    const { authorizationParams, authorizationUriScheme } = SiweConnector;
    const authorizationUri = new URL(`${authorizationUriScheme}://authorize`);

    authorizationUri.searchParams.set(authorizationParams.domain, session.domain);
    authorizationUri.searchParams.set(authorizationParams.uri, session.uri);
    authorizationUri.searchParams.set(authorizationParams.nonce, session.nonce);
    authorizationUri.searchParams.set(authorizationParams.issuedAt, session.issuedAt);
    authorizationUri.searchParams.set(authorizationParams.expirationTime, session.expirationTime);
    authorizationUri.searchParams.set(authorizationParams.chainIds, session.chainIds.join(','));
    authorizationUri.searchParams.set(authorizationParams.statement, session.statement);

    return authorizationUri.toString();
  };

const getUserInfo =
  (getConfig: GetConnectorConfig): GetUserInfo =>
  async (data, getSession) => {
    const config = await getConfig(defaultMetadata.id);
    validateConfig(config, siweConfigGuard);

    const callbackDataResult = siweCallbackDataGuard.safeParse(data);

    if (!callbackDataResult.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidRequestParameters, {
        errorDescription: 'Missing SIWE message or signature',
      });
    }

    const sessionResult = siweSessionGuard.safeParse(await getSession());

    if (!sessionResult.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidRequestParameters, {
        errorDescription: 'SIWE connector session not found or invalid',
      });
    }

    const session = sessionResult.data;
    const { message: rawMessage, signature } = callbackDataResult.data;
    const { normalizedMessage, checksumAddress } = normalizeMessageAddress(rawMessage);
    const message = parseMessage(normalizedMessage);

    validateMessage(message, session);

    if (!isHex(signature)) {
      throw invalidMessage('Invalid signature format');
    }

    const recoveredAddress = await recoverMessageAddress({
      message: rawMessage,
      signature,
    }).catch(() => {
      throw invalidMessage('Unable to recover the signer address');
    });

    // Compare in lowercase as a defensive measure; the recovered address and the normalized
    // address should both be EIP-55 checksummed.
    if (recoveredAddress.toLowerCase() !== checksumAddress.toLowerCase()) {
      throw invalidMessage('Signature does not match the wallet address');
    }

    return {
      id: checksumAddress,
      rawData: {
        address: checksumAddress,
        chainId: message.chainId,
      },
    };
  };

const createSiweConnector: CreateConnector<SocialConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Social,
    configGuard: siweConfigGuard,
    getAuthorizationUri: getAuthorizationUri(getConfig),
    getUserInfo: getUserInfo(getConfig),
  };
};

export default createSiweConnector;
