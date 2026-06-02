import { describe, expect, it } from 'vitest';

import { defaultUsernamePolicy, usernamePolicyGuard } from './username-policy.js';

describe('usernamePolicyGuard', () => {
  it('accepts the default policy', () => {
    expect(usernamePolicyGuard.safeParse(defaultUsernamePolicy).success).toBe(true);
  });

  it('rejects minLength > maxLength', () => {
    const result = usernamePolicyGuard.safeParse({
      ...defaultUsernamePolicy,
      minLength: 10,
      maxLength: 3,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a numbers-only policy (no valid leading char)', () => {
    const result = usernamePolicyGuard.safeParse({
      ...defaultUsernamePolicy,
      allowedChars: { lowercase: false, uppercase: false, numbers: true, underscore: false },
    });
    expect(result.success).toBe(false);
  });

  it('accepts underscore as the only leading char class', () => {
    const result = usernamePolicyGuard.safeParse({
      ...defaultUsernamePolicy,
      allowedChars: { lowercase: false, uppercase: false, numbers: true, underscore: true },
    });
    expect(result.success).toBe(true);
  });

  it('rejects out-of-range length', () => {
    expect(usernamePolicyGuard.safeParse({ ...defaultUsernamePolicy, minLength: 0 }).success).toBe(
      false
    );
    expect(
      usernamePolicyGuard.safeParse({ ...defaultUsernamePolicy, maxLength: 129 }).success
    ).toBe(false);
  });
});
