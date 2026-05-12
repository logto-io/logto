import { describe, expect, it } from 'vitest';

import {
  hasCustomUiCspSources,
  normalizeCustomUiCsp,
  normalizeCustomUiCspSourceExpression,
} from './custom-ui-csp.js';

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
    ['scriptSrc', 'wss://events.example.com', 'Unsupported scheme'],
    ['connectSrc', 'http://example.com', 'Unsupported scheme'],
    ['scriptSrc', 'https://example.com; report-uri /csp', 'Semicolons are not allowed'],
    ['scriptSrc', "'unsafe-inline'", 'CSP keywords are not supported'],
    [
      'scriptSrc',
      'https://user@example.com',
      'Credentials, query strings, and fragments are not allowed',
    ],
    [
      'scriptSrc',
      'https://example.com?foo=bar',
      'Credentials, query strings, and fragments are not allowed',
    ],
    ['connectSrc', 'https://*.*.example.com', 'Malformed wildcard host'],
    ['connectSrc', 'https://example', 'Malformed host'],
  ] as const)('rejects %s source %s', (directive, source, reason) => {
    expect(normalizeCustomUiCspSourceExpression(directive, source)).toEqual({
      isValid: false,
      reason,
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
      reason: 'Unsupported scheme',
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
          reason: 'CSP keywords are not supported',
        },
        {
          directive: 'connectSrc',
          source: 'https://example',
          reason: 'Malformed host',
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
