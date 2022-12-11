import type { CreateUser, User } from '@logto/schemas';
import { ConnectorType } from '@logto/schemas';
import { mockEsm, mockEsmWithActual } from '@logto/shared/esm';
import { getUnixTime } from 'date-fns';

import {
  mockLogtoConnectorList,
  mockPasswordEncrypted,
  mockUser,
  mockUserResponse,
} from '#src/__mocks__/index.js';
import type { SocialUserInfo } from '#src/connectors/types.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const getLogtoConnectorById = jest.fn(async () => ({
  dbEntry: { enabled: true },
  metadata: { id: 'connectorId', target: 'mock_social' },
  type: ConnectorType.Social,
  getAuthorizationUri: jest.fn(async () => ''),
}));

mockEsm('#src/connectors/index.js', () => ({
  getLogtoConnectors: mockLogtoConnectorList,
  getLogtoConnectorById,
}));

const { getUserInfoByAuthCode } = await mockEsmWithActual('#src/lib/social.js', () => ({
  findSocialRelatedUser: jest.fn(async () => [{ id: 'user1', identities: {}, isSuspended: false }]),
  getUserInfoByAuthCode: jest.fn(),
}));

const {
  findUserById,
  hasUser,
  hasUserWithEmail,
  hasUserWithPhone,
  updateUserById,
  deleteUserIdentity,
} = await mockEsmWithActual('#src/queries/user.js', () => ({
  findUserById: jest.fn(async (): Promise<User> => mockUser),
  hasUser: jest.fn(async () => false),
  hasUserWithEmail: jest.fn(async () => false),
  hasUserWithPhone: jest.fn(async () => false),
  updateUserById: jest.fn(
    async (_, data: Partial<CreateUser>): Promise<User> => ({
      ...mockUser,
      ...data,
    })
  ),
  deleteUserIdentity: jest.fn(),
}));

const { encryptUserPassword } = await mockEsmWithActual('#src/lib/user.js', () => ({
  encryptUserPassword: jest.fn(async (password: string) => ({
    passwordEncrypted: password + '_user1',
    passwordEncryptionMethod: 'Argon2i',
  })),
}));

mockEsm('#src/queries/sign-in-experience.js', () => ({
  findDefaultSignInExperience: jest.fn(async () => ({
    signUp: {
      identifier: [],
      password: false,
      verify: false,
    },
  })),
}));

const { argon2Verify } = mockEsm('hash-wasm', () => ({
  argon2Verify: jest.fn(async (password: string) => password === mockPasswordEncrypted),
}));

const { default: profileRoutes, profileRoute } = await import('./profile.js');

describe('session -> profileRoutes', () => {
  const provider = createMockProvider();
  // @ts-expect-error for testing
  const mockGetSession: jest.Mock = jest.spyOn(provider.Session, 'get');
  const sessionRequest = createRequester({
    anonymousRoutes: profileRoutes,
    provider,
    middlewares: [
      async (ctx, next) => {
        ctx.addLogContext = jest.fn();
        ctx.log = jest.fn();

        return next();
      },
    ],
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockImplementation(async () => ({
      accountId: 'id',
      loginTs: getUnixTime(new Date()) - 60,
    }));
  });

  describe('GET /session/profile', () => {
    it('should return current user data', async () => {
      const response = await sessionRequest.get(profileRoute);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(mockUserResponse);
    });

    it('should throw when the user is not authenticated', async () => {
      mockGetSession.mockImplementationOnce(
        jest.fn(async () => ({
          accountId: undefined,
          loginTs: undefined,
        }))
      );

      const response = await sessionRequest.get(profileRoute);
      expect(response.statusCode).toEqual(401);
    });
  });

  describe('PATCH /session/profile', () => {
    it('should update current user with display name, avatar and custom data', async () => {
      const updatedUserInfo = {
        name: 'John Doe',
        avatar: 'https://new-avatar.cdn.com',
        customData: { gender: 'male', age: '30' },
      };

      const response = await sessionRequest.patch(profileRoute).send(updatedUserInfo);

      expect(updateUserById).toBeCalledWith('id', expect.objectContaining(updatedUserInfo));
      expect(response.statusCode).toEqual(204);
    });

    it('should throw when the user is not authenticated', async () => {
      mockGetSession.mockImplementationOnce(
        jest.fn(async () => ({
          accountId: undefined,
          loginTs: undefined,
        }))
      );

      const response = await sessionRequest.patch(profileRoute).send({ name: 'John Doe' });
      expect(response.statusCode).toEqual(401);
    });
  });

  describe('PATCH /session/profile/username', () => {
    it('should throw if last authentication time is over 10 mins ago', async () => {
      mockGetSession.mockImplementationOnce(async () => ({
        accountId: 'id',
        loginTs: getUnixTime(new Date()) - 601,
      }));

      const response = await sessionRequest
        .patch(`${profileRoute}/username`)
        .send({ username: 'test' });

      expect(response.statusCode).toEqual(422);
      expect(updateUserById).not.toBeCalled();
    });

    it('should update username with the new value', async () => {
      const newUsername = 'charles';

      const response = await sessionRequest
        .patch(`${profileRoute}/username`)
        .send({ username: newUsername });

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ ...mockUserResponse, username: newUsername });
    });

    it('should throw when username is already in use', async () => {
      hasUser.mockImplementationOnce(async () => true);

      const response = await sessionRequest
        .patch(`${profileRoute}/username`)
        .send({ username: 'test' });

      expect(response.statusCode).toEqual(422);
    });
  });

  describe('PATCH /session/profile/password', () => {
    it('should throw if last authentication time is over 10 mins ago', async () => {
      mockGetSession.mockImplementationOnce(async () => ({
        accountId: 'id',
        loginTs: getUnixTime(new Date()) - 601,
      }));

      const response = await sessionRequest
        .patch(`${profileRoute}/password`)
        .send({ password: mockPasswordEncrypted });

      expect(response.statusCode).toEqual(422);
      expect(updateUserById).not.toBeCalled();
    });

    it('should update password with the new value', async () => {
      const response = await sessionRequest
        .patch(`${profileRoute}/password`)
        .send({ password: mockPasswordEncrypted });

      expect(updateUserById).toBeCalledWith(
        'id',
        expect.objectContaining({
          passwordEncrypted: 'a1b2c3_user1',
          passwordEncryptionMethod: 'Argon2i',
        })
      );
      expect(response.statusCode).toEqual(204);
    });

    it('should throw if new password is identical to old password', async () => {
      encryptUserPassword.mockImplementationOnce(async (password: string) => ({
        passwordEncrypted: password,
        passwordEncryptionMethod: 'Argon2i',
      }));
      argon2Verify.mockResolvedValueOnce(true);

      const response = await sessionRequest
        .patch(`${profileRoute}/password`)
        .send({ password: 'password' });

      expect(response.statusCode).toEqual(422);
      expect(updateUserById).not.toBeCalled();
    });
  });

  describe('email related APIs', () => {
    it('should throw if last authentication time is over 10 mins ago on linking email', async () => {
      mockGetSession.mockImplementationOnce(async () => ({
        accountId: 'id',
        loginTs: getUnixTime(new Date()) - 601,
      }));

      const response = await sessionRequest
        .patch(`${profileRoute}/email`)
        .send({ primaryEmail: 'test@logto.io' });

      expect(response.statusCode).toEqual(422);
      expect(updateUserById).not.toBeCalled();
    });

    it('should link email address to the user profile', async () => {
      const mockEmailAddress = 'bar@logto.io';
      const response = await sessionRequest
        .patch(`${profileRoute}/email`)
        .send({ primaryEmail: mockEmailAddress });

      expect(updateUserById).toBeCalledWith(
        'id',
        expect.objectContaining({
          primaryEmail: mockEmailAddress,
        })
      );
      expect(response.statusCode).toEqual(204);
    });

    it('should throw when email address already exists', async () => {
      hasUserWithEmail.mockImplementationOnce(async () => true);

      const response = await sessionRequest
        .patch(`${profileRoute}/email`)
        .send({ primaryEmail: mockUser.primaryEmail });

      expect(response.statusCode).toEqual(422);
      expect(updateUserById).not.toBeCalled();
    });

    it('should throw when email address is invalid', async () => {
      hasUserWithEmail.mockImplementationOnce(async () => true);

      const response = await sessionRequest
        .patch(`${profileRoute}/email`)
        .send({ primaryEmail: 'test' });

      expect(response.statusCode).toEqual(400);
      expect(updateUserById).not.toBeCalled();
    });

    it('should throw if last authentication time is over 10 mins ago on unlinking email', async () => {
      mockGetSession.mockImplementationOnce(async () => ({
        accountId: 'id',
        loginTs: getUnixTime(new Date()) - 601,
      }));

      const response = await sessionRequest.delete(`${profileRoute}/email`);

      expect(response.statusCode).toEqual(422);
      expect(updateUserById).not.toBeCalled();
    });

    it('should unlink email address from user', async () => {
      const response = await sessionRequest.delete(`${profileRoute}/email`);
      expect(response.statusCode).toEqual(204);
      expect(updateUserById).toBeCalledWith(
        'id',
        expect.objectContaining({
          primaryEmail: null,
        })
      );
    });

    it('should throw when no email address found in user on unlinking email', async () => {
      findUserById.mockImplementationOnce(async () => ({ ...mockUser, primaryEmail: null }));
      const response = await sessionRequest.delete(`${profileRoute}/email`);

      expect(response.statusCode).toEqual(422);
      expect(updateUserById).not.toBeCalled();
    });
  });

  describe('phone related APIs', () => {
    it('should throw if last authentication time is over 10 mins ago on linking phone number', async () => {
      mockGetSession.mockImplementationOnce(async () => ({
        accountId: 'id',
        loginTs: getUnixTime(new Date()) - 601,
      }));

      const updateResponse = await sessionRequest
        .patch(`${profileRoute}/phone`)
        .send({ primaryPhone: '6533333333' });

      expect(updateResponse.statusCode).toEqual(422);
      expect(updateUserById).not.toBeCalled();
    });

    it('should link phone number to the user profile', async () => {
      const mockPhoneNumber = '6533333333';
      const response = await sessionRequest
        .patch(`${profileRoute}/phone`)
        .send({ primaryPhone: mockPhoneNumber });

      expect(updateUserById).toBeCalledWith(
        'id',
        expect.objectContaining({
          primaryPhone: mockPhoneNumber,
        })
      );
      expect(response.statusCode).toEqual(204);
    });

    it('should throw when phone number already exists on linking phone number', async () => {
      hasUserWithPhone.mockImplementationOnce(async () => true);

      const response = await sessionRequest
        .patch(`${profileRoute}/phone`)
        .send({ primaryPhone: mockUser.primaryPhone });

      expect(response.statusCode).toEqual(422);
      expect(updateUserById).not.toBeCalled();
    });

    it('should throw when phone number is invalid', async () => {
      hasUserWithPhone.mockImplementationOnce(async () => true);

      const response = await sessionRequest
        .patch(`${profileRoute}/phone`)
        .send({ primaryPhone: 'invalid' });

      expect(response.statusCode).toEqual(400);
      expect(updateUserById).not.toBeCalled();
    });

    it('should throw if last authentication time is over 10 mins ago on unlinking phone number', async () => {
      mockGetSession.mockImplementationOnce(async () => ({
        accountId: 'id',
        loginTs: getUnixTime(new Date()) - 601,
      }));

      const response = await sessionRequest.delete(`${profileRoute}/phone`);

      expect(response.statusCode).toEqual(422);
      expect(updateUserById).not.toBeCalled();
    });

    it('should unlink phone number from user', async () => {
      const response = await sessionRequest.delete(`${profileRoute}/phone`);
      expect(response.statusCode).toEqual(204);
      expect(updateUserById).toBeCalledWith(
        'id',
        expect.objectContaining({
          primaryPhone: null,
        })
      );
    });

    it('should throw when no phone number found in user on unlinking phone number', async () => {
      findUserById.mockImplementationOnce(async () => ({ ...mockUser, primaryPhone: null }));
      const response = await sessionRequest.delete(`${profileRoute}/phone`);

      expect(response.statusCode).toEqual(422);
      expect(updateUserById).not.toBeCalled();
    });
  });

  describe('social identities related APIs', () => {
    it('should update social identities for current user', async () => {
      const mockSocialUserInfo: SocialUserInfo = {
        id: 'social_user_id',
        name: 'John Doe',
        avatar: 'https://avatar.social.com/johndoe',
        email: 'johndoe@social.com',
        phone: '123456789',
      };
      getUserInfoByAuthCode.mockReturnValueOnce(mockSocialUserInfo);

      const response = await sessionRequest.patch(`${profileRoute}/identities`).send({
        connectorId: 'connectorId',
        data: { code: '123456' },
      });

      expect(response.statusCode).toEqual(204);
      expect(updateUserById).toBeCalledWith(
        'id',
        expect.objectContaining({
          identities: {
            ...mockUser.identities,
            mock_social: { userId: mockSocialUserInfo.id, details: mockSocialUserInfo },
          },
        })
      );
    });

    it('should throw when the user is not authenticated', async () => {
      mockGetSession.mockImplementationOnce(
        jest.fn(async () => ({
          accountId: undefined,
          loginTs: undefined,
        }))
      );

      const response = await sessionRequest.patch(`${profileRoute}/identities`).send({
        connectorId: 'connectorId',
        data: { code: '123456' },
      });

      expect(response.statusCode).toEqual(401);
      expect(updateUserById).not.toBeCalled();
    });

    it('should throw if last authentication time is over 10 mins ago on linking email', async () => {
      mockGetSession.mockImplementationOnce(async () => ({
        accountId: 'id',
        loginTs: getUnixTime(new Date()) - 601,
      }));

      const response = await sessionRequest
        .patch(`${profileRoute}/identities`)
        .send({ connectorId: 'connectorId', data: { code: '123456' } });

      expect(response.statusCode).toEqual(422);
      expect(updateUserById).not.toBeCalled();
    });

    it('should unlink social identities from user', async () => {
      findUserById.mockImplementationOnce(async () => ({
        ...mockUser,
        identities: {
          mock_social: {
            userId: 'social_user_id',
            details: {
              id: 'social_user_id',
              name: 'John Doe',
            },
          },
        },
      }));

      const response = await sessionRequest.delete(`${profileRoute}/identities/mock_social`);

      expect(response.statusCode).toEqual(204);
      expect(deleteUserIdentity).toBeCalledWith('id', 'mock_social');
    });
  });
});
