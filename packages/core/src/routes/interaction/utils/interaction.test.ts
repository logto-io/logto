import type { Identifier } from '../types/index.js';
import { mergeIdentifiers } from './interaction.js';

describe('interaction utils', () => {
  const usernameIdentifier: Identifier = { key: 'accountId', value: 'foo' };
  const emailIdentifier: Identifier = { key: 'emailVerified', value: 'foo@logto.io' };
  const phoneIdentifier: Identifier = { key: 'phoneVerified', value: '12346' };

  describe('mergeIdentifiers', () => {
    it('new identifiers only ', () => {
      expect(mergeIdentifiers([usernameIdentifier])).toEqual([usernameIdentifier]);
    });

    it('same identifiers should replace', () => {
      expect(mergeIdentifiers([usernameIdentifier], [{ key: 'accountId', value: 'foo2' }])).toEqual(
        [usernameIdentifier]
      );
    });

    it('different identifiers should merge', () => {
      expect(mergeIdentifiers([emailIdentifier], [usernameIdentifier])).toEqual([
        usernameIdentifier,
        emailIdentifier,
      ]);

      expect(mergeIdentifiers([usernameIdentifier], [emailIdentifier, phoneIdentifier])).toEqual([
        emailIdentifier,
        phoneIdentifier,
        usernameIdentifier,
      ]);
    });

    it('mixed identifiers should replace and merge', () => {
      expect(
        mergeIdentifiers(
          [phoneIdentifier, usernameIdentifier],
          [emailIdentifier, { key: 'phoneVerified', value: '465789' }]
        )
      ).toEqual([emailIdentifier, phoneIdentifier, usernameIdentifier]);
    });
  });
});
