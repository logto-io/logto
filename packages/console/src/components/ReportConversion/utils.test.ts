import { hashEmail } from './utils';

describe('hashEmail()', () => {
  it('should return undefined if the given email is falsy', async () => {
    expect(await hashEmail()).toBeUndefined();
    expect(await hashEmail('')).toBeUndefined();
    expect(await hashEmail(' ')).toBeUndefined();
  });

  it('should return undefined if the given email is invalid', async () => {
    expect(await hashEmail('foo')).toBeUndefined();
    expect(await hashEmail('foo@')).toBeUndefined();
    expect(await hashEmail('@foo')).toBeUndefined();
    expect(await hashEmail('foo@bar@baz')).toBeUndefined();
    expect(await hashEmail('foo@ bar .@')).toBeUndefined();
  });

  it('should return the hash of the canonicalized email', async () => {
    const hash = 'ff8d9819fc0e12bf0d24892e45987e249a28dce836a85cad60e28eaaa8c6d976';
    expect(await hashEmail('alice@example.com')).toBe(hash);
    expect(await hashEmail('Al.ice+Apple@Example.Com')).toBe(hash);
    expect(await hashEmail('  a.Lice+@example.com')).toBe(hash);
  });
});
