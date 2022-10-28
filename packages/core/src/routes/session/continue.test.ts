import dayjs from 'dayjs';
import { Provider } from 'oidc-provider';

import { mockUser } from '@/__mocks__';
import { createRequester } from '@/utils/test-utils';

import continueRoutes, { continueRoute } from './continue';

const checkRequiredProfile = jest.fn();
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  checkRequiredProfile: () => checkRequiredProfile(),
}));

jest.mock('@/queries/sign-in-experience', () => ({
  findDefaultSignInExperience: jest.fn(),
}));

const updateUserById = jest.fn(async (..._args: unknown[]) => mockUser);
const findUserById = jest.fn(async (..._args: unknown[]) => mockUser);

jest.mock('@/queries/user', () => ({
  updateUserById: async (...args: unknown[]) => updateUserById(...args),
  findUserById: async () => findUserById(),
}));

const interactionResult = jest.fn(async () => 'redirectTo');
const interactionDetails: jest.MockedFunction<() => Promise<unknown>> = jest.fn(async () => ({}));

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    interactionDetails,
    interactionResult,
  })),
}));

afterEach(() => {
  interactionResult.mockClear();
});

describe('session -> continueRoutes', () => {
  const sessionRequest = createRequester({
    anonymousRoutes: continueRoutes,
    provider: new Provider(''),
    middlewares: [
      async (ctx, next) => {
        ctx.addLogContext = jest.fn();
        ctx.log = jest.fn();

        return next();
      },
    ],
  });

  describe('POST /session/sign-in/continue/password', () => {
    it('updates user password, checks required profile, and sign in', async () => {
      interactionDetails.mockResolvedValueOnce({
        jti: 'jti',
        result: {
          continueSignIn: {
            userId: mockUser.id,
            expiresAt: dayjs().add(1, 'day').toISOString(),
          },
        },
      });
      findUserById.mockResolvedValueOnce({
        ...mockUser,
        passwordEncrypted: null,
        identities: {},
      });
      const response = await sessionRequest.post(`${continueRoute}/password`).send({
        password: 'password',
      });
      expect(response.statusCode).toEqual(200);
      expect(checkRequiredProfile).toHaveBeenCalled();
      expect(updateUserById).toHaveBeenCalledWith(mockUser.id, expect.anything());
      expect(response.body).toHaveProperty('redirectTo');
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ login: { accountId: mockUser.id } }),
        expect.anything()
      );
    });

    it('throws on empty continue sign in storage', async () => {
      interactionDetails.mockResolvedValueOnce({
        jti: 'jti',
        result: {},
      });
      const response = await sessionRequest.post(`${continueRoute}/password`).send({
        password: 'password',
      });
      expect(response.statusCode).toEqual(401);
    });

    it('throws on expired continue sign in storage', async () => {
      interactionDetails.mockResolvedValueOnce({
        jti: 'jti',
        result: {
          continueSignIn: {
            userId: mockUser.id,
            expiresAt: dayjs().subtract(1, 'second').toISOString(),
          },
        },
      });
      const response = await sessionRequest.post(`${continueRoute}/password`).send({
        password: 'password',
      });
      expect(response.statusCode).toEqual(401);
    });
  });
});
