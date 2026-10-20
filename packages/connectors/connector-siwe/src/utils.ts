import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';

import { defaultChainIds } from './constant.js';

/**
 * EIP-4361's statement ABNF allows printable US-ASCII except `"`, `%`, `<`, `>`, `\`, `^`, `` ` ``,
 * `{`, `|`, and `}`.
 */
const statementPattern = /^[ !#$&-;=?-[\]_a-z~]+$/;

/**
 * Collapse whitespace and trim a configured statement. Returns `undefined` for an empty value so
 * the connector can fall back to {@link defaultStatement}.
 */
export const normalizeStatement = (statement?: string) => {
  const normalized = statement?.replace(/\s+/g, ' ').trim();

  return normalized?.length ? normalized : undefined;
};

export const isValidStatement = (statement: string) => statementPattern.test(statement);

const isValidChainIdToken = (token: string) => {
  if (!/^\d+$/.test(token)) {
    return false;
  }

  const chainId = Number(token);

  return Number.isSafeInteger(chainId) && chainId > 0;
};

export const isValidChainIds = (value: string) => {
  const tokens = value.split(/[\s,]+/).filter(Boolean);

  return tokens.every((token) => isValidChainIdToken(token));
};

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

  const invalidToken = tokens.find((token) => !isValidChainIdToken(token));

  if (invalidToken) {
    throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, {
      errorDescription: `Invalid EVM chain ID: ${invalidToken}`,
    });
  }

  return [...new Set(tokens.map(Number))];
};
