import { PasscodeType, User } from '@logto/schemas';
import dayjs from 'dayjs';
import { Provider } from 'oidc-provider';

import { mockPasswordEncrypted, mockUserWithPassword } from '@/__mocks__';
import RequestError from '@/errors/RequestError';
import { createRequester } from '@/utils/test-utils';

import forgotPasswordRoutes, { forgotPasswordRoute } from './forgot-password';

const encryptUserPassword = jest.fn(async (password: string) => ({
  passwordEncrypted: password + '_user1',
  passwordEncryptionMethod: 'Argon2i',
}));
const findUserById = jest.fn(async (): Promise<User> => mockUserWithPassword);
const updateUserById = jest.fn(async (..._args: unknown[]) => ({ id: 'id' }));

jest.mock('@/lib/user', () => ({
  ...jest.requireActual('@/lib/user'),
  encryptUserPassword: async (password: string) => encryptUserPassword(password),
}));

jest.mock('@/queries/user', () => ({
  ...jest.requireActual('@/queries/user'),
  hasUserWithPhone: async (phone: string) => phone === '13000000000',
  findUserByPhone: async () => ({ id: 'id' }),
  hasUserWithEmail: async (email: string) => email === 'a@a.com',
  findUserByEmail: async () => ({ id: 'id' }),
  findUserById: async () => findUserById(),
  updateUserById: async (...args: unknown[]) => updateUserById(...args),
}));

const sendPasscode = jest.fn(async () => ({ dbEntry: { id: 'connectorIdValue' } }));
jest.mock('@/lib/passcode', () => ({
  createPasscode: async () => ({ id: 'id' }),
  sendPasscode: async () => sendPasscode(),
  verifyPasscode: async (_a: unknown, _b: unknown, code: string) => {
    if (code !== '1234') {
      throw new RequestError('passcode.code_mismatch');
    }
  },
}));

const mockArgon2Verify = jest.fn(async (password: string) => password === mockPasswordEncrypted);
jest.mock('hash-wasm', () => ({
  argon2Verify: async (password: string) => mockArgon2Verify(password),
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

describe('session -> forgotPasswordRoutes', () => {
  const sessionRequest = createRequester({
    anonymousRoutes: forgotPasswordRoutes,
    provider: new Provider(''),
    middlewares: [
      async (ctx, next) => {
        ctx.addLogContext = jest.fn();
        ctx.log = jest.fn();

        return next();
      },
    ],
  });

  describe('POST /session/forgot-password/reset', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('assign result and redirect', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            id: 'id',
            expiresAt: dayjs().add(1, 'day').toISOString(),
            flow: PasscodeType.ForgotPassword,
          },
        },
      });
      const response = await sessionRequest
        .post(`${forgotPasswordRoute}/reset`)
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
    it('should throw when `id` is missing', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            expiresAt: dayjs().add(1, 'day').toISOString(),
            flow: PasscodeType.ForgotPassword,
          },
        },
      });
      const response = await sessionRequest
        .post(`${forgotPasswordRoute}/reset`)
        .send({ password: mockPasswordEncrypted });
      expect(response).toHaveProperty('status', 404);
      expect(updateUserById).toBeCalledTimes(0);
    });
    it('should throw when flow is not `forgot-password`', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            id: 'id',
            expiresAt: dayjs().add(1, 'day').toISOString(),
            flow: PasscodeType.SignIn,
          },
        },
      });
      const response = await sessionRequest
        .post(`${forgotPasswordRoute}/reset`)
        .send({ password: mockPasswordEncrypted });
      expect(response).toHaveProperty('status', 404);
      expect(updateUserById).toBeCalledTimes(0);
    });
    it('should throw when `verification.expiresAt` is not string', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: { id: 'id', expiresAt: 0, flow: PasscodeType.ForgotPassword },
        },
      });
      const response = await sessionRequest
        .post(`${forgotPasswordRoute}/reset`)
        .send({ password: mockPasswordEncrypted });
      expect(response).toHaveProperty('status', 404);
      expect(updateUserById).toBeCalledTimes(0);
    });
    it('should throw when `expiresAt` is not a valid date string', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            id: 'id',
            expiresAt: 'invalid date string',
            flow: PasscodeType.ForgotPassword,
          },
        },
      });
      const response = await sessionRequest
        .post(`${forgotPasswordRoute}/reset`)
        .send({ password: mockPasswordEncrypted });
      expect(response).toHaveProperty('status', 401);
      expect(updateUserById).toBeCalledTimes(0);
    });
    it('should throw when verification expires', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            id: 'id',
            expiresAt: dayjs().subtract(1, 'day').toISOString(),
            flow: PasscodeType.ForgotPassword,
          },
        },
      });
      const response = await sessionRequest
        .post(`${forgotPasswordRoute}/reset`)
        .send({ password: mockPasswordEncrypted });
      expect(response).toHaveProperty('status', 401);
      expect(updateUserById).toBeCalledTimes(0);
    });
    it('should throw when new password is the same as old one', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            id: 'id',
            expiresAt: dayjs().add(1, 'day').toISOString(),
            flow: PasscodeType.ForgotPassword,
          },
        },
      });
      mockArgon2Verify.mockResolvedValueOnce(true);
      const response = await sessionRequest
        .post(`${forgotPasswordRoute}/reset`)
        .send({ password: mockPasswordEncrypted });
      expect(response).toHaveProperty('status', 400);
      expect(updateUserById).toBeCalledTimes(0);
    });
    it('should redirect when there was no old password', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            id: 'id',
            expiresAt: dayjs().add(1, 'day').toISOString(),
            flow: PasscodeType.ForgotPassword,
          },
        },
      });
      findUserById.mockResolvedValueOnce({
        ...mockUserWithPassword,
        passwordEncrypted: null,
        passwordEncryptionMethod: null,
      });
      const response = await sessionRequest
        .post(`${forgotPasswordRoute}/reset`)
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
  });
});
