import { lookup } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';

import ky, { HTTPError, type Options } from 'ky';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';

const allowedProtocols = new Set(['http:', 'https:']);
const redirectStatuses = new Set([301, 302, 303, 307, 308]);
const defaultMaxRedirects = 5;

type AssertSafeOutboundRequestUrlOptions = {
  readonly allowPrivateIp?: boolean;
};

type SafeKyPostOptions = Options & {
  readonly maxRedirects?: number;
};

type IpVersion = 'ipv4' | 'ipv6';

type IpBlock = {
  readonly address: string;
  readonly prefix?: number;
  readonly type: IpVersion;
};

const throwEndpointNotAllowed = (): never => {
  throw new RequestError({ code: 'hook.endpoint_not_allowed', status: 422 });
};

const parseUrl = (url: string): URL => {
  try {
    return new URL(url);
  } catch {
    return throwEndpointNotAllowed();
  }
};

const resolveSafeUrlAddresses = async (url: URL): Promise<string[]> => {
  try {
    return await resolveUrlAddresses(url);
  } catch {
    return throwEndpointNotAllowed();
  }
};

const metadataIpBlocks: readonly IpBlock[] = [
  { address: '169.254.169.254', type: 'ipv4' },
  { address: 'fd00:ec2::254', type: 'ipv6' },
  { address: '::ffff:169.254.169.254', type: 'ipv6' },
];

const blockedIpBlocks: readonly IpBlock[] = [
  { address: '0.0.0.0', prefix: 8, type: 'ipv4' },
  { address: '10.0.0.0', prefix: 8, type: 'ipv4' },
  { address: '127.0.0.0', prefix: 8, type: 'ipv4' },
  { address: '100.64.0.0', prefix: 10, type: 'ipv4' },
  { address: '169.254.0.0', prefix: 16, type: 'ipv4' },
  { address: '172.16.0.0', prefix: 12, type: 'ipv4' },
  { address: '192.168.0.0', prefix: 16, type: 'ipv4' },
  { address: '192.0.0.0', prefix: 24, type: 'ipv4' },
  { address: '192.0.2.0', prefix: 24, type: 'ipv4' },
  { address: '198.18.0.0', prefix: 15, type: 'ipv4' },
  { address: '198.51.100.0', prefix: 24, type: 'ipv4' },
  { address: '203.0.113.0', prefix: 24, type: 'ipv4' },
  { address: '224.0.0.0', prefix: 3, type: 'ipv4' },
  { address: '::', type: 'ipv6' },
  { address: '::1', type: 'ipv6' },
  { address: 'fc00::', prefix: 7, type: 'ipv6' },
  { address: 'fe80::', prefix: 10, type: 'ipv6' },
  { address: 'ff00::', prefix: 8, type: 'ipv6' },
  { address: '2001:db8::', prefix: 32, type: 'ipv6' },
  { address: '::ffff:0.0.0.0', prefix: 104, type: 'ipv6' },
  { address: '::ffff:10.0.0.0', prefix: 104, type: 'ipv6' },
  { address: '::ffff:127.0.0.0', prefix: 104, type: 'ipv6' },
  { address: '::ffff:100.64.0.0', prefix: 106, type: 'ipv6' },
  { address: '::ffff:169.254.0.0', prefix: 112, type: 'ipv6' },
  { address: '::ffff:172.16.0.0', prefix: 108, type: 'ipv6' },
  { address: '::ffff:192.168.0.0', prefix: 112, type: 'ipv6' },
  { address: '::ffff:192.0.0.0', prefix: 120, type: 'ipv6' },
  { address: '::ffff:192.0.2.0', prefix: 120, type: 'ipv6' },
  { address: '::ffff:198.18.0.0', prefix: 111, type: 'ipv6' },
  { address: '::ffff:198.51.100.0', prefix: 120, type: 'ipv6' },
  { address: '::ffff:203.0.113.0', prefix: 120, type: 'ipv6' },
  { address: '::ffff:224.0.0.0', prefix: 99, type: 'ipv6' },
];

const createBlockList = (blocks: readonly IpBlock[]) => {
  const blockList = new BlockList();

  for (const { address, prefix, type } of blocks) {
    if (prefix === undefined) {
      blockList.addAddress(address, type);
      continue;
    }

    blockList.addSubnet(address, prefix, type);
  }

  return blockList;
};

const metadataBlockList = createBlockList(metadataIpBlocks);
const blockedIpBlockList = createBlockList(blockedIpBlocks);

const normalizeIpAddress = (address: string) => {
  const withoutOpeningBracket = address.startsWith('[') ? address.slice(1) : address;

  return (
    withoutOpeningBracket.endsWith(']') ? withoutOpeningBracket.slice(0, -1) : withoutOpeningBracket
  ).toLowerCase();
};

const getIpVersion = (address: string): IpVersion | undefined => {
  const version = isIP(address);

  if (version === 4) {
    return 'ipv4';
  }

  if (version === 6) {
    return 'ipv6';
  }
};

const isBlockedBy = (blockList: BlockList, address: string) => {
  const ipVersion = getIpVersion(address);

  return ipVersion === undefined ? false : blockList.check(address, ipVersion);
};

const isMetadataIpAddress = (address: string) => isBlockedBy(metadataBlockList, address);

const isBlockedIpAddress = (address: string) => isBlockedBy(blockedIpBlockList, address);

const resolveUrlAddresses = async ({ hostname }: URL) => {
  const normalizedHostname = normalizeIpAddress(hostname);

  if (normalizedHostname === 'localhost') {
    return ['127.0.0.1'];
  }

  if (isIP(normalizedHostname)) {
    return [normalizedHostname];
  }

  const addresses = await lookup(normalizedHostname, { all: true, verbatim: true });

  return addresses.map(({ address }) => address);
};

export const assertSafeOutboundRequestUrl = async (
  url: string,
  {
    allowPrivateIp = EnvSet.values.allowPrivateOutboundRequests,
  }: AssertSafeOutboundRequestUrlOptions = {}
) => {
  const parsedUrl = parseUrl(url);

  if (!allowedProtocols.has(parsedUrl.protocol)) {
    throwEndpointNotAllowed();
  }

  const addresses = await resolveSafeUrlAddresses(parsedUrl);

  if (addresses.some((address) => isMetadataIpAddress(address))) {
    throwEndpointNotAllowed();
  }

  if (!allowPrivateIp && addresses.some((address) => isBlockedIpAddress(address))) {
    throwEndpointNotAllowed();
  }
};

export const assertSafeWebhookEndpointUrl = async (url: string) =>
  assertSafeOutboundRequestUrl(url);

export const safeKyPost = async (url: string, options: SafeKyPostOptions = {}) => {
  const { maxRedirects = defaultMaxRedirects, ...kyOptions } = options;

  const postWithRedirectValidation = async (
    requestUrl: string,
    redirectCount = 0
  ): Promise<Response> => {
    if (redirectCount > maxRedirects) {
      throw new TypeError('Webhook endpoint redirected too many times.');
    }

    await assertSafeWebhookEndpointUrl(requestUrl);

    const response = await ky.post(requestUrl, {
      ...kyOptions,
      redirect: 'manual',
      throwHttpErrors: false,
    });

    if (!redirectStatuses.has(response.status)) {
      if (!response.ok && kyOptions.throwHttpErrors !== false) {
        throw new HTTPError(
          response,
          new Request(requestUrl, { method: 'POST' }),
          // eslint-disable-next-line no-restricted-syntax -- HTTPError requires ky's internal normalized options.
          kyOptions as never
        );
      }

      return response;
    }

    const location = response.headers.get('location');

    if (!location) {
      throw new HTTPError(
        response,
        new Request(requestUrl, { method: 'POST' }),
        // eslint-disable-next-line no-restricted-syntax -- HTTPError requires ky's internal normalized options.
        kyOptions as never
      );
    }

    return postWithRedirectValidation(new URL(location, requestUrl).href, redirectCount + 1);
  };

  return postWithRedirectValidation(url);
};
