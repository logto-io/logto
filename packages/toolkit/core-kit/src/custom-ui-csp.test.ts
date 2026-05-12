import { describe, expect, it } from 'vitest';

import {
  CustomUiCspSourceValidationErrorCode,
  customUiCspGuard,
  hasCustomUiCspSources,
  normalizeCustomUiCsp,
  normalizeCustomUiCspSourceExpression,
} from './custom-ui-csp.js';

describe('customUiCspGuard', () => {
  it.each([
    {},
    { scriptSrc: ['https://example.com'] },
    { connectSrc: ['https://api.example.com'] },
    {
      scriptSrc: ['https://example.com'],
      connectSrc: ['https://api.example.com'],
    },
  ])('accepts %p', (value) => {
    expect(customUiCspGuard.safeParse(value).success).toBe(true);
  });

  it('rejects unsupported directives', () => {
    expect(customUiCspGuard.safeParse({ imgSrc: ['https://example.com'] }).success).toBe(false);
  });
});

describe('normalizeCustomUiCspSourceExpression()', () => {
  it.each([
    ['scriptSrc', 'https://example.com', 'https://example.com'],
    ['scriptSrc', 'https://*.example.com/path/', 'https://*.example.com/path/'],
    ['connectSrc', 'wss://events.example.com', 'wss://events.example.com'],
    ['connectSrc', ' https://api.example.com ', 'https://api.example.com'],
  ] as const)('normalizes %s source %s', (directive, source, value) => {
    expect(normalizeCustomUiCspSourceExpression(directive, source)).toEqual({
      isValid: true,
      value,
    });
  });

  it.each([
    [
      'scriptSrc',
      'wss://events.example.com',
      CustomUiCspSourceValidationErrorCode.UnsupportedScheme,
    ],
    ['connectSrc', 'http://example.com', CustomUiCspSourceValidationErrorCode.UnsupportedScheme],
    [
      'scriptSrc',
      'https://example.com; report-uri /csp',
      CustomUiCspSourceValidationErrorCode.SemicolonNotAllowed,
    ],
    ['scriptSrc', "'unsafe-inline'", CustomUiCspSourceValidationErrorCode.CspKeywordNotSupported],
    [
      'scriptSrc',
      'https://user@example.com',
      CustomUiCspSourceValidationErrorCode.DisallowedUrlParts,
    ],
    [
      'scriptSrc',
      'https://example.com?foo=bar',
      CustomUiCspSourceValidationErrorCode.DisallowedUrlParts,
    ],
    [
      'connectSrc',
      'https://*.*.example.com',
      CustomUiCspSourceValidationErrorCode.MalformedWildcardHost,
    ],
    ['connectSrc', 'https://example', CustomUiCspSourceValidationErrorCode.MalformedHost],
  ] as const)('rejects %s source %s', (directive, source, code) => {
    expect(normalizeCustomUiCspSourceExpression(directive, source)).toEqual({
      isValid: false,
      code,
    });
  });

  it('allows localhost HTTP sources only outside production', () => {
    expect(normalizeCustomUiCspSourceExpression('scriptSrc', 'http://localhost:3000')).toEqual({
      isValid: true,
      value: 'http://localhost:3000',
    });

    expect(
      normalizeCustomUiCspSourceExpression('scriptSrc', 'http://localhost:3000', {
        isProduction: true,
      })
    ).toEqual({
      isValid: false,
      code: CustomUiCspSourceValidationErrorCode.UnsupportedScheme,
    });
  });
});

describe('normalizeCustomUiCsp()', () => {
  it('normalizes, deduplicates, and drops empty directive arrays', () => {
    expect(
      normalizeCustomUiCsp({
        scriptSrc: [' https://EXAMPLE.com ', 'https://example.com', 'https://*.example.com/path/'],
        connectSrc: [],
      })
    ).toEqual({
      customUiCsp: {
        scriptSrc: ['https://example.com', 'https://*.example.com/path/'],
      },
      errors: [],
    });
  });

  it('collects validation errors with directive context', () => {
    expect(
      normalizeCustomUiCsp({
        scriptSrc: ["'unsafe-inline'"],
        connectSrc: ['https://example'],
      })
    ).toEqual({
      customUiCsp: {},
      errors: [
        {
          directive: 'scriptSrc',
          source: "'unsafe-inline'",
          code: CustomUiCspSourceValidationErrorCode.CspKeywordNotSupported,
        },
        {
          directive: 'connectSrc',
          source: 'https://example',
          code: CustomUiCspSourceValidationErrorCode.MalformedHost,
        },
      ],
    });
  });
});

describe('hasCustomUiCspSources()', () => {
  it('returns whether any supported directive has configured sources', () => {
    expect(hasCustomUiCspSources()).toBe(false);
    expect(hasCustomUiCspSources({})).toBe(false);
    expect(hasCustomUiCspSources({ scriptSrc: [] })).toBe(false);
    expect(hasCustomUiCspSources({ connectSrc: ['https://example.com'] })).toBe(true);
  });
});
