import { describe, expect, it } from 'vitest';

import { getUserDisplayName } from './user-display-name.js';

describe('getUserDisplayName', () => {
  it('should get user display name from name', () => {
    const user = {
      name: 'test',
      username: 'test',
      primaryEmail: 'test',
      primaryPhone: 'test',
    };
    expect(getUserDisplayName(user)).toEqual('test');
  });
});
