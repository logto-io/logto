import type { ProfileMap, UserProfile } from './types.js';
import { userProfileMapping } from './utils.js';

describe('userProfileMapping', () => {
  it('should return valid profile (`id` is string and `avatar` not correctly mapped)', () => {
    const keyMapping: ProfileMap = {
      id: 'id',
      email: 'email',
      phone: 'phone',
      name: 'name',
      avatar: 'avatar',
    };
    const originUserProfile = {
      id: '123456',
      email: 'octcat@github.com',
      phone: null,
      name: 'Oct Cat',
      avatar_url: 'avatar.png',
    };
    const profile: UserProfile = userProfileMapping(originUserProfile, keyMapping);
    expect(profile).toMatchObject({
      id: '123456',
      email: 'octcat@github.com',
      name: 'Oct Cat',
    });
  });

  it('should return valid profile (`id` is number and `avatar` correctly mapped)', () => {
    const keyMapping: ProfileMap = {
      id: 'id',
      email: 'email',
      phone: 'phone',
      name: 'name',
      avatar: 'avatar_url',
    };
    const originUserProfile = {
      id: 123_456,
      email: 'octcat@github.com',
      phone: undefined,
      name: 'Oct Cat',
      avatar_url: 'avatar.png',
    };
    const profile: UserProfile = userProfileMapping(originUserProfile, keyMapping);
    expect(profile).toMatchObject({
      id: '123456',
      email: 'octcat@github.com',
      name: 'Oct Cat',
      avatar: 'avatar.png',
    });
  });
});
