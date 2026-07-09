import { describe, expect, it } from 'vitest';

import {
  findBlockedAllowlistItems,
  isEmailBlocklistItem,
  isEmailListItem,
  isEmailListItemFullyCoveredByBlockItem,
  matchesEmailBlocklistItem,
  matchesEmailListItem,
} from './email-blocklist.js';

describe('email list helpers', () => {
  describe('isEmailListItem', () => {
    it('validates exact email and domain items', () => {
      expect(isEmailListItem('foo@example.com')).toBe(true);
      expect(isEmailListItem('@example.com')).toBe(true);
    });

    it('validates wildcard email and domain items', () => {
      expect(isEmailListItem('foo*@example.com')).toBe(true);
      expect(isEmailListItem('*@example.com')).toBe(true);
      expect(isEmailListItem('foo@*.example.com')).toBe(true);
      expect(isEmailListItem('@foo.*')).toBe(true);
      expect(isEmailListItem('@*.example.com')).toBe(true);
    });

    it.each(['foo*', '@*', 'foo@*', 'foo@example', '@example', '*@*.*'])(
      'rejects malformed wildcard item: %s',
      (item) => {
        expect(isEmailListItem(item)).toBe(false);
      }
    );
  });

  describe('matchesEmailListItem', () => {
    it('matches exact email and domain items case-insensitively', () => {
      expect(matchesEmailListItem('foo@example.com', 'Foo@Example.com')).toBe(true);
      expect(matchesEmailListItem('@example.com', 'foo@Example.com')).toBe(true);
      expect(matchesEmailListItem('foo@example.com', 'bar@example.com')).toBe(false);
      expect(matchesEmailListItem('@example.com', 'foo@example.org')).toBe(false);
    });

    it('matches wildcard email and domain items case-insensitively', () => {
      expect(matchesEmailListItem('foo*@example.com', 'FooBar@Example.com')).toBe(true);
      expect(matchesEmailListItem('*@example.com', 'anything@Example.com')).toBe(true);
      expect(matchesEmailListItem('foo@*.example.com', 'Foo@bar.Example.com')).toBe(true);
      expect(matchesEmailListItem('@foo.*', 'bar@Foo.com')).toBe(true);
      expect(matchesEmailListItem('@*.example.com', 'bar@Foo.Example.com')).toBe(true);
    });

    it('treats regex metacharacters as literal characters in wildcard items', () => {
      expect(matchesEmailListItem('foo.+*@example.com', 'foo.+bar@example.com')).toBe(true);
      expect(matchesEmailListItem('foo.+*@example.com', 'fooxbar@example.com')).toBe(false);
    });
  });

  describe('isEmailListItemFullyCoveredByBlockItem', () => {
    it('detects exact allowlist entries fully covered by exact, domain, and wildcard block items', () => {
      expect(isEmailListItemFullyCoveredByBlockItem('foo@email.com', 'foo@email.com')).toBe(true);
      expect(isEmailListItemFullyCoveredByBlockItem('foo@email.com', '@email.com')).toBe(true);
      expect(isEmailListItemFullyCoveredByBlockItem('foo@email.com', 'f*@email.com')).toBe(true);
      expect(isEmailListItemFullyCoveredByBlockItem('😀@email.com', '😀@email.com')).toBe(true);
      expect(isEmailListItemFullyCoveredByBlockItem('😀@email.com', '*@email.com')).toBe(true);
      expect(isEmailListItemFullyCoveredByBlockItem('foo@email.com', 'bar@email.com')).toBe(false);
    });

    it('detects wildcard allowlist entries fully covered by wider block items', () => {
      expect(isEmailListItemFullyCoveredByBlockItem('foo*@email.com', '@email.com')).toBe(true);
      expect(isEmailListItemFullyCoveredByBlockItem('foo*@email.com', 'f*@email.com')).toBe(true);
      expect(isEmailListItemFullyCoveredByBlockItem('foo*@email.com', 'foo1@email.com')).toBe(
        false
      );
    });

    it('detects domain allowlist entries fully covered by domain or wildcard-all email block items', () => {
      expect(isEmailListItemFullyCoveredByBlockItem('@email.com', '@email.com')).toBe(true);
      expect(isEmailListItemFullyCoveredByBlockItem('@team.email.com', '@*.email.com')).toBe(true);
      expect(isEmailListItemFullyCoveredByBlockItem('@email.com', '*@email.com')).toBe(true);
      expect(isEmailListItemFullyCoveredByBlockItem('@email.com', 'foo@email.com')).toBe(false);
      expect(isEmailListItemFullyCoveredByBlockItem('@example.com', 'bad@example.com')).toBe(false);
    });

    it('returns false for malformed allowlist or blocklist items', () => {
      expect(isEmailListItemFullyCoveredByBlockItem('@', '@email.com')).toBe(false);
      expect(isEmailListItemFullyCoveredByBlockItem('@email.com@foo', '@email.com')).toBe(false);
      expect(isEmailListItemFullyCoveredByBlockItem('foo@bar', '@bar')).toBe(false);
      expect(isEmailListItemFullyCoveredByBlockItem('@example', '@example.com')).toBe(false);
      expect(isEmailListItemFullyCoveredByBlockItem('@email.com', '@')).toBe(false);
      expect(isEmailListItemFullyCoveredByBlockItem('@email.com', '@email.com@foo')).toBe(false);
      expect(isEmailListItemFullyCoveredByBlockItem('@email.com', 'foo@bar')).toBe(false);
      expect(isEmailListItemFullyCoveredByBlockItem('@email.com', '@example')).toBe(false);
    });
  });

  describe('findBlockedAllowlistItems', () => {
    it('returns allowlist entries fully covered by custom blocklist entries', () => {
      expect(
        findBlockedAllowlistItems(['foo@email.com', '@example.com', 'foo*@example.com'], {
          customBlocklist: ['f*@email.com', 'bad@example.com'],
        })
      ).toEqual([{ allowItem: 'foo@email.com', blockedBy: 'f*@email.com' }]);
    });

    it('returns allowlist entries fully covered by subaddressing block rules', () => {
      expect(
        findBlockedAllowlistItems(
          ['foo+bar@email.com', 'foo+*@email.com', 'foo*@email.com', 'foo+bar@example'],
          {
            blockSubaddressing: true,
          }
        )
      ).toEqual([
        { allowItem: 'foo+bar@email.com', blockedBy: 'blockSubaddressing' },
        { allowItem: 'foo+*@email.com', blockedBy: 'blockSubaddressing' },
      ]);
    });
  });

  describe('blocklist compatibility exports', () => {
    it('keeps existing blocklist helper names available', () => {
      expect(isEmailBlocklistItem('@example.com')).toBe(true);
      expect(matchesEmailBlocklistItem('@example.com', 'foo@example.com')).toBe(true);
    });
  });
});
