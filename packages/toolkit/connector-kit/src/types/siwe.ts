/**
 * Shared definitions for the Sign-In with Ethereum (SIWE / EIP-4361) connector.
 *
 * Unlike typical social connectors, SIWE does not redirect users to a third-party
 * authorization page. The connector returns the parameters required to build a SIWE message,
 * and the experience builds and signs the message with the user's browser wallet.
 *
 * The constants and the message builder live here because both the connector (verification)
 * and the experience (message construction) must agree on the same wire format.
 *
 * @see {@link https://eips.ethereum.org/EIPS/eip-4361 | EIP-4361}
 */
import { keccak_256 } from '@noble/hashes/sha3';
import { bytesToHex } from '@noble/hashes/utils';

/**
 * Convert an EVM address to its EIP-55 checksum representation.
 *
 * The core matches users by the exact string stored in `identities[target].userId`, so all
 * addresses must use one canonical casing. Wallets are not consistent about the casing they
 * return.
 *
 * @throws If the input is not a 20-byte hex address.
 */
export const toChecksumAddress = (address: string): string => {
  const normalized = address.toLowerCase().replace(/^0x/, '');

  if (!/^[\da-f]{40}$/.test(normalized)) {
    throw new Error(`Invalid EVM address: ${address}`);
  }

  const hash = bytesToHex(
    keccak_256(Uint8Array.from(normalized, (character) => character.codePointAt(0) ?? 0))
  );
  const checksummed = [...normalized].map((character, index) =>
    Number.parseInt(hash.charAt(index), 16) >= 8 ? character.toUpperCase() : character
  );

  return `0x${checksummed.join('')}`;
};

export const siweAuthorizationParams = Object.freeze({
  /** The host (including a non-default port) of the sign-in page. */
  domain: 'domain',
  /** The origin of the sign-in page. */
  uri: 'uri',
  /** The one-time nonce stored in the connector session. */
  nonce: 'nonce',
  /** The ISO 8601 timestamp when the message is issued. */
  issuedAt: 'issuedAt',
  /** The ISO 8601 timestamp when the message expires. */
  expirationTime: 'expirationTime',
  /** A comma-separated list of allowed EVM chain IDs. */
  chainIds: 'chainIds',
  /** An optional statement shown by the wallet. */
  statement: 'statement',
});

/**
 * The target of the EVM wallet connector.
 *
 * All EVM-compatible chains share the same address format and `personal_sign` behavior, so a
 * single connector target covers Ethereum, Polygon, BNB Chain, Arbitrum, Base, and others.
 */
export const SiweConnector = Object.freeze({
  target: 'ethereum',
  factoryId: 'siwe',
  /**
   * The custom URI scheme used to pass the authorization parameters from the connector to the
   * experience. The URI is never opened by a browser; it only carries the parameters.
   */
  authorizationUriScheme: 'siwe',
  authorizationParams: siweAuthorizationParams,
});

export type SiweMessageParams = {
  /** The host of the sign-in page, e.g. `example.logto.app`. */
  domain: string;
  /** The EIP-55 checksummed wallet address. */
  address: string;
  /** The origin of the sign-in page, e.g. `https://example.logto.app`. */
  uri: string;
  /** The one-time nonce. */
  nonce: string;
  /** The ISO 8601 timestamp when the message is issued. */
  issuedAt: string;
  /** The ISO 8601 timestamp when the message expires. */
  expirationTime: string;
  /** The EVM chain ID the wallet is connected to. */
  chainId: number;
  /** An optional statement shown by the wallet. */
  statement?: string;
};

/**
 * Build an EIP-4361 message.
 *
 * The format is defined by the ABNF in EIP-4361. Newlines in the statement are collapsed to
 * spaces because the statement is a single line in the message and is configured by an
 * administrator.
 */
export const createSiweMessage = ({
  domain,
  address,
  uri,
  nonce,
  issuedAt,
  expirationTime,
  chainId,
  statement,
}: SiweMessageParams): string => {
  const normalizedStatement = statement?.replace(/\r?\n/g, ' ').trim();
  const statementBlock = normalizedStatement ? `${normalizedStatement}\n\n` : '';

  return `${domain} wants you to sign in with your Ethereum account:
${address}

${statementBlock}URI: ${uri}
Version: 1
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}
Expiration Time: ${expirationTime}`;
};
