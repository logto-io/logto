import { describe, expect, it } from 'vitest';

import {
  DomainVerificationFileContentType,
  domainVerificationFilesGuard,
} from './custom-domain.js';

describe('domainVerificationFilesGuard', () => {
  it.each([
    '/MP_verify_abc123.txt',
    '/google-site-verification.html',
    '/.well-known/apple-developer-merchantid-domain-association',
    '/.well-known/acme-challenge/token_123',
  ])('accepts verification file path %s', (path) => {
    expect(
      domainVerificationFilesGuard.safeParse([
        { path, content: 'verification-content', contentType: 'text/plain' },
      ]).success
    ).toBe(true);
  });

  it.each(['/api/file.txt', '/../secret.txt', '/nested/file.txt', '/file', '/file%2Etxt'])(
    'rejects verification file path %s',
    (path) => {
      expect(
        domainVerificationFilesGuard.safeParse([
          { path, content: 'verification-content', contentType: 'text/plain' },
        ]).success
      ).toBe(false);
    }
  );

  it('requires valid JSON for JSON responses', () => {
    expect(
      domainVerificationFilesGuard.safeParse([
        {
          path: '/.well-known/verification.json',
          content: '{invalid-json}',
          contentType: DomainVerificationFileContentType.Json,
        },
      ]).success
    ).toBe(false);
  });

  it('rejects duplicate paths', () => {
    expect(
      domainVerificationFilesGuard.safeParse([
        { path: '/verify.txt', content: 'one', contentType: 'text/plain' },
        { path: '/verify.txt', content: 'two', contentType: 'text/plain' },
      ]).success
    ).toBe(false);
  });
});
