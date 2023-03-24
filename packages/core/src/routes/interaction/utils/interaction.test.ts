import { mergeIdentifiers, categorizeIdentifiers } from './interaction.js';
import type { Identifier } from '../types/index.js';

describe('interaction utils', () => {
  const usernameIdentifier: Identifier = { key: 'accountId', value: 'foo' };
  const emailIdentifier: Identifier = { key: 'emailVerified', value: 'foo@logto.io' };
  const phoneIdentifier: Identifier = { key: 'phoneVerified', value: '12346' };
  const socialIdentifier: Identifier = {
    key: 'social',
    connectorId: 'foo_connector',
    userInfo: { id: 'foo' },
  };

  describe('mergeIdentifiers', () => {
    it('new identifiers only ', () => {
      expect(mergeIdentifiers(usernameIdentifier)).toEqual([usernameIdentifier]);
    });

    it('same identifiers should replace', () => {
      expect(mergeIdentifiers(usernameIdentifier, [{ key: 'accountId', value: 'foo2' }])).toEqual([
        usernameIdentifier,
      ]);
    });

    it('different identifiers should merge', () => {
      expect(mergeIdentifiers(emailIdentifier, [usernameIdentifier])).toEqual([
        usernameIdentifier,
        emailIdentifier,
      ]);

      expect(mergeIdentifiers(usernameIdentifier, [emailIdentifier, phoneIdentifier])).toEqual([
        emailIdentifier,
        phoneIdentifier,
        usernameIdentifier,
      ]);
    });
  });

  describe('categorizeIdentifiers', () => {
    it('should categorize identifiers', () => {
      expect(
        categorizeIdentifiers(
          [usernameIdentifier, emailIdentifier, phoneIdentifier, socialIdentifier],
          { email: 'foo@logto.io', connectorId: 'foo_connector' }
        )
      ).toEqual({
        authIdentifiers: [usernameIdentifier, phoneIdentifier],
        profileIdentifiers: [emailIdentifier, socialIdentifier],
      });
    });
  });
});
