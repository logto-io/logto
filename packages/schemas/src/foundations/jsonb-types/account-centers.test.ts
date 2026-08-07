import { describe, expect, it } from 'vitest';

import { AccountCenterControlValue, accountCenterFieldControlGuard } from './account-centers.js';

describe('accountCenterFieldControlGuard', () => {
  it('allows trusted device control to be omitted', () => {
    expect(accountCenterFieldControlGuard.parse({})).toEqual({});
  });

  it.each(Object.values(AccountCenterControlValue))(
    'accepts trusted device control value %s',
    (trustedDevice) => {
      expect(accountCenterFieldControlGuard.parse({ trustedDevice })).toEqual({ trustedDevice });
    }
  );

  it('rejects an invalid trusted device control value', () => {
    expect(accountCenterFieldControlGuard.safeParse({ trustedDevice: 'Invalid' }).success).toBe(
      false
    );
  });
});
