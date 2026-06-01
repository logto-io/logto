import { describe, expect, it } from 'vitest';

import {
  formatMailbox,
  parseSendFrom,
  sanitizeMailboxAddress,
  sanitizeMailboxDisplayName,
  stripHeaderControlChars,
} from './smtp-mailbox.js';

describe('stripHeaderControlChars', () => {
  it('removes CR/LF from header values', () => {
    expect(stripHeaderControlChars('a\rb\nc')).toBe('abc');
  });
});

describe('parseSendFrom', () => {
  const fallbackEmail = 'noreply@example.com';
  const fallbackName = 'Logto';

  it('parses a simple mailbox', () => {
    expect(parseSendFrom('Support <support@example.com>', fallbackEmail)).toEqual({
      email: 'support@example.com',
      name: 'Support',
    });
  });

  it('parses mailbox when display name contains angle brackets', () => {
    expect(parseSendFrom('My <App> <support@example.com>', fallbackEmail)).toEqual({
      email: 'support@example.com',
      name: 'My App',
    });
  });

  it('strips inner angle brackets from a malformed mailbox address', () => {
    expect(parseSendFrom('Brand <bad<addr@example.com>', fallbackEmail)).toEqual({
      email: 'badaddr@example.com',
      name: 'Brand',
    });
  });

  it('uses fallback email when sendFrom is display name only', () => {
    expect(parseSendFrom('Test App', fallbackEmail, fallbackName)).toEqual({
      email: fallbackEmail,
      name: 'Test App',
    });
  });

  it('accepts a bare email address', () => {
    expect(parseSendFrom('support@example.com', fallbackEmail)).toEqual({
      email: 'support@example.com',
      name: undefined,
    });
  });
});

describe('formatMailbox', () => {
  it('formats name and email', () => {
    expect(formatMailbox('support@example.com', 'Support')).toBe('Support <support@example.com>');
  });

  it('sanitizes display names with angle brackets', () => {
    expect(formatMailbox('support@example.com', 'My <App>')).toBe('My App <support@example.com>');
  });
});

describe('sanitizeMailboxAddress', () => {
  it('strips angle brackets from addresses', () => {
    expect(sanitizeMailboxAddress('bad<addr@example.com')).toBe('badaddr@example.com');
  });
});

describe('sanitizeMailboxDisplayName', () => {
  it('strips angle brackets from display names', () => {
    expect(sanitizeMailboxDisplayName('My <App>')).toBe('My App');
  });
});
