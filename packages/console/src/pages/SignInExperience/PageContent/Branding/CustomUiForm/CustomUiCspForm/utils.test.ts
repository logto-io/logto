import { createCustomUiCspValidator, normalizeCustomUiCspSourceExpression } from './utils';

const messages = {
  duplicate: 'Duplicate source',
  invalid: 'Invalid source',
};

describe('Custom UI CSP source validation', () => {
  it.each([
    ['scriptSrc', 'https://example.com', 'https://example.com'],
    ['scriptSrc', 'https://*.example.com/path/', 'https://*.example.com/path/'],
    ['connectSrc', 'wss://events.example.com', 'wss://events.example.com'],
    ['connectSrc', ' https://api.example.com ', 'https://api.example.com'],
  ] as const)('accepts %s source %s', (directive, source, expected) => {
    expect(normalizeCustomUiCspSourceExpression(directive, source)).toBe(expected);
  });

  it.each([
    ['scriptSrc', 'wss://events.example.com'],
    ['connectSrc', 'http://example.com'],
    ['scriptSrc', 'https://example.com; report-uri /csp'],
    ['scriptSrc', "'unsafe-inline'"],
    ['scriptSrc', 'https://user@example.com'],
    ['scriptSrc', 'https://example.com?foo=bar'],
    ['connectSrc', 'https://*.*.example.com'],
    ['connectSrc', 'https://example'],
  ] as const)('rejects %s source %s', (directive, source) => {
    expect(normalizeCustomUiCspSourceExpression(directive, source)).toBe(false);
  });

  it('allows localhost HTTP sources only outside production', () => {
    expect(
      normalizeCustomUiCspSourceExpression('scriptSrc', 'http://localhost:3000', {
        isProductionEnv: false,
      })
    ).toBe('http://localhost:3000');

    expect(
      normalizeCustomUiCspSourceExpression('scriptSrc', 'http://localhost:3000', {
        isProductionEnv: true,
      })
    ).toBe(false);
  });

  it('returns a field-level duplicate validation error', () => {
    const result = createCustomUiCspValidator(
      'scriptSrc',
      messages
    )(['https://example.com', ' https://EXAMPLE.com ']);

    expect(result).toEqual(JSON.stringify({ inputs: { 1: messages.duplicate } }));
  });
});
