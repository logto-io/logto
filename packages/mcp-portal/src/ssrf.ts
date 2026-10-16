import { lookup } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';

export class UpstreamUrlError extends Error {}

/** Ranges an upstream must never resolve into: loopback, private, link-local, metadata, reserved. */
const blockList = new BlockList();

blockList.addSubnet('0.0.0.0', 8, 'ipv4'); // "this" network
blockList.addSubnet('10.0.0.0', 8, 'ipv4'); // Private
blockList.addSubnet('100.64.0.0', 10, 'ipv4'); // Carrier-grade NAT
blockList.addSubnet('127.0.0.0', 8, 'ipv4'); // Loopback
blockList.addSubnet('169.254.0.0', 16, 'ipv4'); // Link-local, including cloud metadata
blockList.addSubnet('172.16.0.0', 12, 'ipv4'); // Private
blockList.addSubnet('192.0.0.0', 24, 'ipv4'); // IETF protocol assignments
blockList.addSubnet('192.168.0.0', 16, 'ipv4'); // Private
blockList.addSubnet('198.18.0.0', 15, 'ipv4'); // Benchmarking
blockList.addSubnet('224.0.0.0', 3, 'ipv4'); // Multicast and reserved
blockList.addSubnet('::', 128, 'ipv6'); // Unspecified
blockList.addSubnet('::1', 128, 'ipv6'); // Loopback
blockList.addSubnet('fc00::', 7, 'ipv6'); // Unique local
blockList.addSubnet('fe80::', 10, 'ipv6'); // Link-local

const dottedMapped = /^:{2}f{4}:((?:\d+\.){3}\d+)$/;
const hexMapped = /^::ffff:([\da-f]{1,4}):([\da-f]{1,4})$/;

/**
 * Converts an IPv4-mapped IPv6 address to dotted IPv4. URL parsing rewrites `::ffff:127.0.0.1` into
 * hex groups (`::ffff:7f00:1`), so both forms are handled.
 */
const mappedToIpv4 = (address: string): string | undefined => {
  const dotted = dottedMapped.exec(address)?.[1];

  if (dotted) {
    return dotted;
  }

  const hex = hexMapped.exec(address);

  if (!hex?.[1] || !hex[2]) {
    return undefined;
  }

  const high = Number.parseInt(hex[1], 16);
  const low = Number.parseInt(hex[2], 16);

  return [Math.floor(high / 256), high % 256, Math.floor(low / 256), low % 256].join('.');
};

const addressBlocked = (address: string): boolean => {
  const normalized = address.toLowerCase();
  const ipv4 = mappedToIpv4(normalized);

  if (ipv4) {
    return blockList.check(ipv4, 'ipv4');
  }

  return blockList.check(normalized, isIP(normalized) === 6 ? 'ipv6' : 'ipv4');
};

const parseUrl = (raw: string): URL => {
  try {
    return new URL(raw);
  } catch {
    throw new UpstreamUrlError('Upstream URL is not a valid URL');
  }
};

const assertHttpsWithoutCredentials = (url: URL) => {
  if (url.protocol !== 'https:') {
    throw new UpstreamUrlError('Upstream URL must use https');
  }

  if (url.username || url.password) {
    throw new UpstreamUrlError('Upstream URL must not contain credentials');
  }
};

const privateAddressError = () =>
  new UpstreamUrlError('Upstream URL must not point to a private address');

/**
 * Validates a user-supplied upstream URL: https only, and every resolved address must be public.
 * Checked at registration time and again on every connection. A DNS rebinding attack between the
 * check and the connection is not fully covered.
 */
export const assertPublicHttpsUrl = async (raw: string): Promise<URL> => {
  const url = parseUrl(raw);
  assertHttpsWithoutCredentials(url);

  // URL.hostname keeps IPv6 brackets; strip them for the IP check.
  const hostname = url.hostname.replace(/^\[(.*)]$/, '$1');

  if (isIP(hostname)) {
    if (addressBlocked(hostname)) {
      throw privateAddressError();
    }

    return url;
  }

  const addresses = await lookup(hostname, { all: true, verbatim: true }).catch(() => {
    throw new UpstreamUrlError('Upstream host could not be resolved');
  });

  if (addresses.some(({ address }) => addressBlocked(address))) {
    throw privateAddressError();
  }

  return url;
};
