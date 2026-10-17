import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { buildAuthorizationUrl, createPkce, isFresh } from './oauth.js';

const metadata = {
  issuer: 'https://auth.example.com',
  authorization_endpoint: 'https://auth.example.com/authorize',
  token_endpoint: 'https://auth.example.com/token',
};

describe('oauth helpers', () => {
  it('derives the S256 challenge from the verifier', () => {
    const { verifier, challenge } = createPkce();
    expect(challenge).toBe(createHash('sha256').update(verifier).digest('base64url'));
    expect(verifier).not.toBe(challenge);
  });

  it('builds an authorization URL with PKCE and the resource indicator', () => {
    const url = new URL(
      buildAuthorizationUrl(metadata, {
        clientId: 'client-1',
        redirectUri: 'https://portal.example.com/cb',
        state: 'state-1',
        codeChallenge: 'challenge-1',
        resource: 'https://mcp.example.com/mcp',
      })
    );
    expect(url.origin + url.pathname).toBe('https://auth.example.com/authorize');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('code_challenge')).toBe('challenge-1');
    expect(url.searchParams.get('resource')).toBe('https://mcp.example.com/mcp');
    expect(url.searchParams.get('state')).toBe('state-1');
  });

  it('treats a token as fresh until a minute before it expires', () => {
    const obtainedAt = 1_000_000;
    const tokens = { access_token: 'a', expires_in: 300, obtainedAt };
    expect(isFresh(tokens, obtainedAt + 100_000)).toBe(true);
    expect(isFresh(tokens, obtainedAt + 250_000)).toBe(false);
    expect(isFresh({ access_token: 'a', obtainedAt })).toBe(true);
  });
});
