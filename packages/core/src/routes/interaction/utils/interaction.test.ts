import type { Identifier } from '../types/index.js';
import { mergeIdentifiers } from './interaction.js';

describe('interaction utils', () => {
  const usernameIdentifier: Identifier = { key: 'accountId', value: 'foo' };
  const emailIdentifier: Identifier = { key: 'emailVerified', value: 'foo@logto.io' };
  const phoneIdentifier: Identifier = { key: 'phoneVerified', value: '12346' };

  it('mergeIdentifiers', () => {
    expect(mergeIdentifiers({})).toEqual(undefined);
    expect(mergeIdentifiers({ oldIdentifiers: [usernameIdentifier] })).toEqual([
      usernameIdentifier,
    ]);
    expect(mergeIdentifiers({ newIdentifiers: [usernameIdentifier] })).toEqual([
      usernameIdentifier,
    ]);
    expect(
      mergeIdentifiers({
        oldIdentifiers: [usernameIdentifier],
        newIdentifiers: [usernameIdentifier],
      })
    ).toEqual([usernameIdentifier]);

    expect(
      mergeIdentifiers({
        oldIdentifiers: [emailIdentifier],
        newIdentifiers: [usernameIdentifier],
      })
    ).toEqual([emailIdentifier, usernameIdentifier]);

    expect(
      mergeIdentifiers({
        oldIdentifiers: [emailIdentifier, phoneIdentifier],
        newIdentifiers: [phoneIdentifier, usernameIdentifier],
      })
    ).toEqual([emailIdentifier, phoneIdentifier, usernameIdentifier]);

    expect(
      mergeIdentifiers({
        oldIdentifiers: [emailIdentifier, phoneIdentifier],
        newIdentifiers: [usernameIdentifier],
      })
    ).toEqual([emailIdentifier, phoneIdentifier, usernameIdentifier]);
  });
});
