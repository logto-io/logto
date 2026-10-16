import { describe, expect, it } from 'vitest';

import { UpstreamUrlError, assertPublicHttpsUrl } from './ssrf.js';

describe('assertPublicHttpsUrl', () => {
  it('accepts a public https URL given as an IP literal', async () => {
    await expect(assertPublicHttpsUrl('https://93.184.216.34/mcp')).resolves.toBeInstanceOf(URL);
  });

  it.each([
    ['plain http', 'http://93.184.216.34/mcp'],
    ['a non-URL', 'not a url'],
    ['embedded credentials', 'https://user:pass@93.184.216.34/mcp'],
  ])('rejects %s', async (_label, url) => {
    await expect(assertPublicHttpsUrl(url)).rejects.toBeInstanceOf(UpstreamUrlError);
  });

  it.each([
    ['loopback', 'https://127.0.0.1/mcp'],
    ['private 10/8', 'https://10.0.0.5/mcp'],
    ['private 192.168/16', 'https://192.168.1.10/mcp'],
    ['private 172.16/12', 'https://172.20.0.1/mcp'],
    ['cloud metadata link-local', 'https://169.254.169.254/latest'],
    ['carrier-grade NAT', 'https://100.100.1.1/mcp'],
    ['IPv6 loopback', 'https://[::1]/mcp'],
    ['IPv6 unique local', 'https://[fd00::1]/mcp'],
    ['IPv4-mapped loopback', 'https://[::ffff:127.0.0.1]/mcp'],
  ])('rejects %s', async (_label, url) => {
    await expect(assertPublicHttpsUrl(url)).rejects.toThrow('private address');
  });

  it('rejects a hostname that resolves to a private address', async () => {
    await expect(assertPublicHttpsUrl('https://localhost/mcp')).rejects.toBeInstanceOf(
      UpstreamUrlError
    );
  });
});
