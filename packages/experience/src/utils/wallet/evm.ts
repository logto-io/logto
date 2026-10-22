import { SiweConnector, createSiweMessage, toChecksumAddress } from '@logto/connector-kit';

/**
 * The subset of the EIP-1193 provider API used by the wallet flow.
 *
 * @see {@link https://eips.ethereum.org/EIPS/eip-1193 | EIP-1193}
 */
export type Eip1193Provider = {
  request: (args: {
    method: string;
    params?: unknown[] | Record<string, unknown>;
  }) => Promise<unknown>;
};

export type WalletOption = {
  id: string;
  name: string;
  icon?: string;
};

export type EvmWallet = WalletOption & {
  provider: Eip1193Provider;
};

export type SiweAuthorizationParams = {
  domain: string;
  uri: string;
  nonce: string;
  issuedAt: string;
  expirationTime: string;
  chainIds: number[];
  statement: string;
};

export type WalletErrorCode = 'not_found' | 'rejected' | 'unsupported_chain' | 'unknown';

export class WalletError extends Error {
  constructor(
    public readonly code: WalletErrorCode,
    message?: string
  ) {
    super(message ?? code);
    this.name = 'WalletError';
  }
}

type Eip6963ProviderInfo = {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
};

type Eip6963ProviderDetail = {
  info: Eip6963ProviderInfo;
  provider: Eip1193Provider;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- declaration merging requires an interface
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

const announceProviderEvent = 'eip6963:announceProvider';
const requestProviderEvent = 'eip6963:requestProvider';

/**
 * EIP-6963 providers announce themselves synchronously in response to the request event. The
 * short delay gives wallets that announce asynchronously a chance to respond without making the
 * button feel sluggish.
 */
const discoveryTimeout = 100;

const isEip1193Provider = (value: unknown): value is Eip1193Provider =>
  typeof value === 'object' &&
  value !== null &&
  'request' in value &&
  typeof value.request === 'function';

/**
 * Discover injected EVM wallets using EIP-6963, falling back to `window.ethereum` for wallets
 * that have not implemented the standard yet.
 */
export const discoverEvmWallets = async (): Promise<EvmWallet[]> => {
  if (typeof window === 'undefined') {
    return [];
  }

  const wallets = new Map<string, EvmWallet>();

  const handleAnnouncement = (event: Event) => {
    // eslint-disable-next-line no-restricted-syntax -- lib.dom does not type EIP-6963 events
    const { detail } = event as CustomEvent<Eip6963ProviderDetail | undefined>;

    if (!detail?.info.uuid || !isEip1193Provider(detail.provider)) {
      return;
    }

    wallets.set(detail.info.uuid, {
      id: detail.info.uuid,
      name: detail.info.name || 'Ethereum Wallet',
      icon: detail.info.icon,
      provider: detail.provider,
    });
  };

  window.addEventListener(announceProviderEvent, handleAnnouncement);
  window.dispatchEvent(new Event(requestProviderEvent));

  await new Promise((resolve) => {
    setTimeout(resolve, discoveryTimeout);
  });

  window.removeEventListener(announceProviderEvent, handleAnnouncement);

  if (wallets.size === 0 && isEip1193Provider(window.ethereum)) {
    wallets.set('injected', {
      id: 'injected',
      name: 'Browser wallet',
      provider: window.ethereum,
    });
  }

  return [...wallets.values()];
};

const getAuthorizationParam = (
  searchParams: URLSearchParams,
  key: string,
  authorizationUri: string
) => {
  const value = searchParams.get(key);

  if (!value) {
    throw new WalletError('unknown', `Missing ${key} in authorization URI: ${authorizationUri}`);
  }

  return value;
};

/**
 * Parse the `siwe://` URI returned by the connector. The URI is only a transport for the
 * parameters; it is never opened by the browser.
 */
const parseAuthorizationUrl = (authorizationUri: string) => {
  try {
    return new URL(authorizationUri);
  } catch {
    throw new WalletError('unknown', `Invalid authorization URI: ${authorizationUri}`);
  }
};

export const parseSiweAuthorizationParams = (authorizationUri: string): SiweAuthorizationParams => {
  const url = parseAuthorizationUrl(authorizationUri);

  if (url.protocol !== `${SiweConnector.authorizationUriScheme}:`) {
    throw new WalletError('unknown', `Unexpected authorization URI scheme: ${url.protocol}`);
  }

  const { authorizationParams } = SiweConnector;
  const chainIds = getAuthorizationParam(
    url.searchParams,
    authorizationParams.chainIds,
    authorizationUri
  )
    .split(',')
    .map((value) => Number.parseInt(value, 10));

  if (
    chainIds.length === 0 ||
    chainIds.some((chainId) => !Number.isSafeInteger(chainId) || chainId <= 0)
  ) {
    throw new WalletError('unknown', 'Invalid chain ID list in authorization URI');
  }

  return {
    domain: getAuthorizationParam(url.searchParams, authorizationParams.domain, authorizationUri),
    uri: getAuthorizationParam(url.searchParams, authorizationParams.uri, authorizationUri),
    nonce: getAuthorizationParam(url.searchParams, authorizationParams.nonce, authorizationUri),
    issuedAt: getAuthorizationParam(
      url.searchParams,
      authorizationParams.issuedAt,
      authorizationUri
    ),
    expirationTime: getAuthorizationParam(
      url.searchParams,
      authorizationParams.expirationTime,
      authorizationUri
    ),
    chainIds,
    statement: getAuthorizationParam(
      url.searchParams,
      authorizationParams.statement,
      authorizationUri
    ),
  };
};

const getErrorCode = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return;
  }

  const { code } = error;

  return typeof code === 'number' ? code : undefined;
};

const toWalletError = (error: unknown): WalletError => {
  if (error instanceof WalletError) {
    return error;
  }

  const code = getErrorCode(error);

  if (code === 4001) {
    return new WalletError('rejected', 'The user rejected the wallet request');
  }

  // EIP-3326: the wallet does not know the requested chain.
  if (code === 4902) {
    return new WalletError('unsupported_chain', 'The wallet does not recognize the network');
  }

  return new WalletError('unknown', error instanceof Error ? error.message : undefined);
};

const getChainId = async (provider: Eip1193Provider) => {
  const value = await provider.request({ method: 'eth_chainId' });

  if (typeof value !== 'string' || !/^0x[\da-f]+$/i.test(value)) {
    throw new WalletError('unknown', 'Unable to read the wallet chain ID');
  }

  return Number.parseInt(value, 16);
};

/**
 * EIP-1474 defines the `personal_sign` data parameter as hex-encoded bytes. Encode the UTF-8
 * SIWE message so wallets that strictly validate the parameter accept it.
 */
const toPersonalSignPayload = (message: string) =>
  `0x${Array.from(new TextEncoder().encode(message), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('')}`;

const switchChain = async (provider: Eip1193Provider, chainId: number) => {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (error) {
    if (getErrorCode(error) === 4001) {
      throw new WalletError('rejected', 'The user rejected the network switch');
    }

    // EIP-3326 defines 4902 for an unknown chain; some wallets report 4200 when they do not
    // implement the method at all. Both mean the wallet cannot reach an allowed network.
    throw new WalletError('unsupported_chain', 'The wallet cannot switch to a supported chain');
  }
};

const getSupportedChainId = async (provider: Eip1193Provider, allowedChainIds: number[]) => {
  const chainId = await getChainId(provider);

  if (allowedChainIds.includes(chainId)) {
    return chainId;
  }

  const [targetChainId] = allowedChainIds;

  if (!targetChainId) {
    throw new WalletError('unsupported_chain', 'No supported chain is configured');
  }

  await switchChain(provider, targetChainId);
  const switchedChainId = await getChainId(provider);

  if (!allowedChainIds.includes(switchedChainId)) {
    throw new WalletError('unsupported_chain', 'The wallet is on an unsupported chain');
  }

  return switchedChainId;
};

/**
 * Connect the selected wallet and sign the SIWE message.
 *
 * The wallet is switched to the first allowed chain only when its current chain is not allowed,
 * so users who are already on a supported network are not prompted to switch.
 */
export const signInWithEvmWallet = async (
  wallet: EvmWallet,
  params: SiweAuthorizationParams
): Promise<{ message: string; signature: string }> => {
  try {
    const accounts = await wallet.provider.request({ method: 'eth_requestAccounts' });
    const account = Array.isArray(accounts)
      ? accounts.find((value): value is string => typeof value === 'string')
      : undefined;

    if (!account) {
      throw new WalletError('unknown', 'The wallet did not return an account');
    }

    const address = toChecksumAddress(account);
    const chainId = await getSupportedChainId(wallet.provider, params.chainIds);

    const message = createSiweMessage({
      ...params,
      address,
      chainId,
    });

    const signature = await wallet.provider.request({
      method: 'personal_sign',
      params: [toPersonalSignPayload(message), address],
    });

    if (typeof signature !== 'string' || !/^0x[\da-f]+$/i.test(signature)) {
      throw new WalletError('unknown', 'The wallet returned an invalid signature');
    }

    return { message, signature };
  } catch (error) {
    throw toWalletError(error);
  }
};
