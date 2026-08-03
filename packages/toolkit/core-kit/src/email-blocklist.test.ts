import { describe, expect, it } from 'vitest';

import { isEmailBlocklistItem, matchesEmailBlocklistItem } from './email-blocklist.js';

describe('email blocklist helpers', () => {
  describe('isEmailBlocklistItem', () => {
    it('validates exact email and domain items', () => {
      expect(isEmailBlocklistItem('foo@example.com')).toBe(true);
      expect(isEmailBlocklistItem('@example.com')).toBe(true);
    });

    it('validates wildcard email and domain items', () => {
      expect(isEmailBlocklistItem('foo*@example.com')).toBe(true);
      expect(isEmailBlocklistItem('*@example.com')).toBe(true);
      expect(isEmailBlocklistItem('foo@*.example.com')).toBe(true);
      expect(isEmailBlocklistItem('@foo.*')).toBe(true);
      expect(isEmailBlocklistItem('@*.example.com')).toBe(true);
    });

    it.each(['foo*', '@*', 'foo@*', 'foo@example', '@example', '*@*.*'])(
      'rejects malformed wildcard item: %s',
      (item) => {
        expect(isEmailBlocklistItem(item)).toBe(false);
      }
    );
  });

  describe('matchesEmailBlocklistItem', () => {
    it('matches exact email and domain items case-insensitively', () => {
      expect(matchesEmailBlocklistItem('foo@example.com', 'Foo@Example.com')).toBe(true);
      expect(matchesEmailBlocklistItem('@example.com', 'foo@Example.com')).toBe(true);
      expect(matchesEmailBlocklistItem('foo@example.com', 'bar@example.com')).toBe(false);
      expect(matchesEmailBlocklistItem('@example.com', 'foo@example.org')).toBe(false);
    });

    it('matches wildcard email and domain items case-insensitively', () => {
      expect(matchesEmailBlocklistItem('foo*@example.com', 'FooBar@Example.com')).toBe(true);
      expect(matchesEmailBlocklistItem('*@example.com', 'anything@Example.com')).toBe(true);
      expect(matchesEmailBlocklistItem('foo@*.example.com', 'Foo@bar.Example.com')).toBe(true);
      expect(matchesEmailBlocklistItem('@foo.*', 'bar@Foo.com')).toBe(true);
      expect(matchesEmailBlocklistItem('@*.example.com', 'bar@Foo.Example.com')).toBe(true);
    });

    it('treats regex metacharacters as literal characters in wildcard items', () => {
      expect(matchesEmailBlocklistItem('foo.+*@example.com', 'foo.+bar@example.com')).toBe(true);
      expect(matchesEmailBlocklistItem('foo.+*@example.com', 'fooxbar@example.com')).toBe(false);
    });

    it('treats Gmail domain aliases and local-part dot variants as the same address', () => {
      expect(matchesEmailBlocklistItem('foo.bar@gmail.com', 'foobar@gmail.com')).toBe(true);
      expect(matchesEmailBlocklistItem('foobar@gmail.com', 'f.o.o.b.a.r@gmail.com')).toBe(true);
      expect(matchesEmailBlocklistItem('foo.bar*@gmail.com', 'foobarbaz@gmail.com')).toBe(true);
      expect(matchesEmailBlocklistItem('foobar*@*.com', 'foo.bar.baz@gmail.com')).toBe(true);
      expect(matchesEmailBlocklistItem('foo.bar@gmail.com', 'foobar@googlemail.com')).toBe(true);
      expect(matchesEmailBlocklistItem('foo.bar@googlemail.com', 'foobar@gmail.com')).toBe(true);
      expect(matchesEmailBlocklistItem('foo@googlemail.*', 'f.oo@gmail.com')).toBe(true);
      expect(matchesEmailBlocklistItem('@gmail.com', 'foo@googlemail.com')).toBe(true);
      expect(matchesEmailBlocklistItem('@googlemail.com', 'foo@gmail.com')).toBe(true);
    });

    it('keeps dots in the local part significant for non-Gmail addresses', () => {
      expect(matchesEmailBlocklistItem('foo.bar@example.com', 'foobar@example.com')).toBe(false);
      expect(matchesEmailBlocklistItem('foobar@*.com', 'foo.bar@example.com')).toBe(false);
    });
  });
});
