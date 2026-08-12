import { mockUser } from '#src/__mocks__/index.js';

import { transpileUserProfileResponse } from './user.js';

describe('transpileUserProfileResponse', () => {
  it('should pin the exposed user info fields', () => {
    expect(transpileUserProfileResponse(mockUser)).toStrictEqual({
      id: mockUser.id,
      username: mockUser.username,
      primaryEmail: mockUser.primaryEmail,
      primaryPhone: mockUser.primaryPhone,
      name: mockUser.name,
      avatar: mockUser.avatar,
      customData: mockUser.customData,
      identities: mockUser.identities,
      lastSignInAt: mockUser.lastSignInAt,
      createdAt: mockUser.createdAt,
      updatedAt: mockUser.updatedAt,
      profile: mockUser.profile,
      applicationId: mockUser.applicationId,
      cimdClientId: mockUser.cimdClientId,
      isSuspended: mockUser.isSuspended,
      hasPassword: true,
    });
  });

  it('should expose the cimd client id when the user is attributed to a cimd client', () => {
    const cimdClientId = 'https://client.example.com/metadata.json';
    const response = transpileUserProfileResponse({
      ...mockUser,
      applicationId: null,
      cimdClientId,
    });

    expect(response.applicationId).toBeNull();
    expect(response.cimdClientId).toBe(cimdClientId);
  });
});
