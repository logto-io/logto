import { userProfileMapping } from './utils.js';

describe('userProfileMapping', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return right user profile', () => {
    const userProfile = userProfileMapping(
      {
        sub: 'sub',
        cell_phone: 'cell_phone',
        phone: 'phone',
        email: 'email',
        verified_email: 'verified_email',
        picture: 'picture.jpg',
        full_name: 'full_name',
      },
      {
        id: 'sub',
        phone: 'cell_phone',
        email: 'verified_email',
        avatar: 'picture_url',
        name: 'full_name',
      }
    );
    expect(userProfile).toEqual({
      id: 'sub',
      phone: 'cell_phone',
      email: 'verified_email',
      name: 'full_name',
    });
  });
});
