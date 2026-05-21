import { CustomUiCspSourceValidationErrorCode } from '@logto/core-kit';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';

import { hasCustomUiCspSources, normalizeCustomUiCsp } from './custom-ui-csp.js';

const originalIsProduction = EnvSet.values.isProduction;

describe('normalizeCustomUiCsp()', () => {
  afterEach(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Restore EnvSet after production-gate tests.
    (EnvSet.values as { isProduction: boolean }).isProduction = originalIsProduction;
  });

  it('should normalize, deduplicate, and drop empty directive arrays', () => {
    expect(
      normalizeCustomUiCsp({
        scriptSrc: [' https://EXAMPLE.com ', 'https://example.com', 'https://*.example.com/path/'],
        connectSrc: [],
      })
    ).toEqual({
      scriptSrc: ['https://example.com', 'https://*.example.com/path/'],
    });
  });

  it('should allow wss only for connectSrc', () => {
    expect(
      normalizeCustomUiCsp({
        connectSrc: ['wss://events.example.com'],
      })
    ).toEqual({
      connectSrc: ['wss://events.example.com'],
    });

    expect(() => normalizeCustomUiCsp({ scriptSrc: ['wss://events.example.com'] })).toThrow(
      RequestError
    );
  });

  it('should expose validation error code in data and readable description in message', () => {
    expect(() => normalizeCustomUiCsp({ scriptSrc: ['wss://events.example.com'] })).toThrow(
      new RequestError(
        {
          code: 'request.invalid_input',
          details:
            'Invalid customUiCsp.scriptSrc source "wss://events.example.com": Unsupported scheme',
        },
        {
          directive: 'scriptSrc',
          source: 'wss://events.example.com',
          validationErrorCode: CustomUiCspSourceValidationErrorCode.UnsupportedScheme,
        }
      )
    );
  });

  it('should allow localhost HTTP sources only outside production', () => {
    expect(normalizeCustomUiCsp({ scriptSrc: ['http://localhost:3000'] })).toEqual({
      scriptSrc: ['http://localhost:3000'],
    });

    // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle EnvSet for production validation.
    (EnvSet.values as { isProduction: boolean }).isProduction = true;

    expect(() => normalizeCustomUiCsp({ scriptSrc: ['http://localhost:3000'] })).toThrow(
      RequestError
    );
  });

  it.each([
    { title: 'empty source', customUiCsp: { scriptSrc: [' '] } },
    { title: 'semicolon', customUiCsp: { scriptSrc: ['https://example.com; report-uri /csp'] } },
    { title: 'CSP keyword', customUiCsp: { scriptSrc: ["'unsafe-inline'"] } },
    { title: 'URL credentials', customUiCsp: { scriptSrc: ['https://user@example.com'] } },
    { title: 'URL query', customUiCsp: { scriptSrc: ['https://example.com?foo=bar'] } },
    { title: 'malformed wildcard host', customUiCsp: { connectSrc: ['https://*.*.example.com'] } },
    { title: 'single-label host', customUiCsp: { connectSrc: ['https://example'] } },
  ])('should reject invalid sources: $title', ({ customUiCsp }) => {
    expect(() => normalizeCustomUiCsp(customUiCsp)).toThrow(RequestError);
  });
});

describe('hasCustomUiCspSources()', () => {
  it('should return whether any supported directive has configured sources', () => {
    expect(hasCustomUiCspSources()).toBe(false);
    expect(hasCustomUiCspSources({})).toBe(false);
    expect(hasCustomUiCspSources({ scriptSrc: [] })).toBe(false);
    expect(hasCustomUiCspSources({ connectSrc: ['https://example.com'] })).toBe(true);
  });
});
