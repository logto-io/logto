import { describe, expect, it } from 'vitest';

import { inspectRequest, type WafRequest, type WafRuleId } from './index.js';

const inspect = (request: Partial<WafRequest>) =>
  inspectRequest({ method: 'GET', rawTarget: '/', headers: {}, ...request }).map(
    ({ ruleId }) => ruleId
  );

describe('inspectRequest()', () => {
  it.each(['TRACE', 'trace', 'TRACK', 'CONNECT'])('rejects unsupported method %s', (method) => {
    expect(inspect({ method })).toEqual(['unsupported-method']);
  });

  it('allows normal Logto methods', () => {
    expect(inspect({ method: 'POST', rawTarget: '/oidc/token' })).toEqual([]);
  });

  it('detects mixed body framing case-insensitively', () => {
    expect(
      inspect({ headers: { 'Content-Length': '10', 'transfer-encoding': 'chunked' } })
    ).toEqual(['ambiguous-body-framing']);
  });

  it('detects conflicting duplicate content lengths but allows equal values', () => {
    expect(inspect({ rawHeaders: ['Content-Length', '10', 'content-length', '11'] })).toEqual([
      'ambiguous-body-framing',
    ]);
    expect(inspect({ rawHeaders: ['Content-Length', '10', 'content-length', ' 10 '] })).toEqual([]);
  });

  it('enforces the request-target length boundary', () => {
    expect(inspect({ rawTarget: `/${'a'.repeat(8191)}` })).toEqual([]);
    expect(inspect({ rawTarget: `/${'a'.repeat(8192)}` })).toEqual(['request-target-too-long']);
  });

  it.each(['/a\0b', '/a%00b', '/a%0db', '/a%0Ab'])('detects target controls in %s', (rawTarget) => {
    expect(inspect({ rawTarget })).toEqual(['request-target-control-character']);
  });

  it('deduplicates multiple matches for one rule', () => {
    expect(inspect({ rawTarget: '/a%00%0d%0ab' })).toEqual(['request-target-control-character']);
  });

  it.each(['/../admin', '/a/%2e%2e/b', '/a/%252e%252e/b'])(
    'detects traversal in %s',
    (rawTarget) => {
      expect(inspect({ rawTarget })).toEqual(['path-traversal']);
    }
  );

  it.each(['/safe/%2e%2e/%', '/safe/%252e%252e/%', '/%/safe/%2e%2e'])(
    'detects traversal beside malformed encoding in %s',
    (rawTarget) => {
      expect(inspect({ rawTarget })).toEqual(['path-traversal']);
    }
  );

  it.each([
    '/oidc/auth?redirect_uri=https%3A%2F%2Fchip.example%2Fcallback&state=a%2Fb',
    '/callback/google?code=abc%2Fdef&state=safe%252Fstate',
    '/oidc/auth?redirect_uri=%',
    '/%6f%69%64%63/%61%75%74%68?%72%65%64%69%72%65%63%74%5f%75%72%69=https%3A%2F%2Fchip.example%2Fcallback',
  ])('preserves legitimate or malformed query encoding in %s', (rawTarget) => {
    expect(inspect({ rawTarget })).toEqual([]);
  });

  it('uses a custom request-target limit', () => {
    expect(
      inspectRequest(
        { method: 'GET', rawTarget: '/12345', headers: {} },
        { maxRequestTargetLength: 5 }
      )
    ).toEqual([{ ruleId: 'request-target-too-long' satisfies WafRuleId }]);
  });

  it('does not mutate request input', () => {
    const headers = Object.freeze({ 'content-length': '10' });
    const rawHeaders = Object.freeze(['Content-Length', '10']);
    const request = Object.freeze({
      method: 'POST',
      rawTarget: '/oidc/token',
      headers,
      rawHeaders,
    });

    expect(inspectRequest(request)).toEqual([]);
    expect(request).toEqual({ method: 'POST', rawTarget: '/oidc/token', headers, rawHeaders });
  });
});
