/* eslint-disable max-lines */
import { PasscodeType, User } from '@logto/schemas';
import dayjs from 'dayjs';
import { Provider } from 'oidc-provider';

import { mockUser } from '@/__mocks__';
import RequestError from '@/errors/RequestError';
import { createRequester } from '@/utils/test-utils';

import { verificationTimeout } from './consts';
import passwordlessRoutes, { registerRoute, signInRoute } from './passwordless';

const insertUser = jest.fn(async (..._args: unknown[]) => ({ id: 'id' }));
const findUserById = jest.fn(async (): Promise<User> => mockUser);
const updateUserById = jest.fn(async (..._args: unknown[]) => ({ id: 'id' }));

jest.mock('@/lib/user', () => ({
  generateUserId: () => 'user1',
  insertUser: async (...args: unknown[]) => insertUser(...args),
}));

jest.mock('@/queries/user', () => ({
  findUserById: async () => findUserById(),
  findUserByPhone: async () => ({ id: 'id' }),
  findUserByEmail: async () => ({ id: 'id' }),
  updateUserById: async (...args: unknown[]) => updateUserById(...args),
  hasUser: async (username: string) => username === 'username1',
  hasUserWithPhone: async (phone: string) => phone === '13000000000',
  hasUserWithEmail: async (email: string) => email === 'a@a.com',
}));

const sendPasscode = jest.fn(async () => ({ dbEntry: { id: 'connectorIdValue' } }));
const createPasscode = jest.fn(async (..._args: unknown[]) => ({ id: 'id' }));
jest.mock('@/lib/passcode', () => ({
  createPasscode: async (..._args: unknown[]) => createPasscode(..._args),
  sendPasscode: async () => sendPasscode(),
  verifyPasscode: async (_a: unknown, _b: unknown, code: string) => {
    if (code !== '1234') {
      throw new RequestError('passcode.code_mismatch');
    }
  },
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

describe('session -> passwordlessRoutes', () => {
  const sessionRequest = createRequester({
    anonymousRoutes: passwordlessRoutes,
    provider: new Provider(''),
    middlewares: [
      async (ctx, next) => {
        ctx.addLogContext = jest.fn();
        ctx.log = jest.fn();

        return next();
      },
    ],
  });

  describe('POST /session/passwordless/sms/send', () => {
    beforeEach(() => {
      interactionDetails.mockResolvedValueOnce({
        jti: 'jti',
      });
    });
    afterEach(() => {
      jest.clearAllMocks();
      jest.resetModules();
    });
    it('should call sendPasscode (with flow `sign-in`)', async () => {
      const response = await sessionRequest
        .post('/session/passwordless/sms/send')
        .send({ phone: '13000000000', flow: PasscodeType.SignIn });
      expect(response.statusCode).toEqual(204);
      expect(createPasscode).toHaveBeenCalledWith('jti', PasscodeType.SignIn, {
        phone: '13000000000',
      });
      expect(sendPasscode).toHaveBeenCalled();
    });
    it('should call sendPasscode (with flow `register`)', async () => {
      const response = await sessionRequest
        .post('/session/passwordless/sms/send')
        .send({ phone: '13000000000', flow: PasscodeType.Register });
      expect(response.statusCode).toEqual(204);
      expect(createPasscode).toHaveBeenCalledWith('jti', PasscodeType.Register, {
        phone: '13000000000',
      });
      expect(sendPasscode).toHaveBeenCalled();
    });
    it('throw when phone not given in input params', async () => {
      const response = await sessionRequest
        .post('/session/passwordless/sms/send')
        .send({ flow: PasscodeType.Register });
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('POST /session/passwordless/email/send', () => {
    beforeEach(() => {
      interactionDetails.mockResolvedValueOnce({
        jti: 'jti',
      });
    });
    afterEach(() => {
      jest.clearAllMocks();
      jest.resetModules();
    });
    it('should call sendPasscode (with flow `sign-in`)', async () => {
      const response = await sessionRequest
        .post('/session/passwordless/email/send')
        .send({ email: 'a@a.com', flow: PasscodeType.SignIn });
      expect(response.statusCode).toEqual(204);
      expect(createPasscode).toHaveBeenCalledWith('jti', PasscodeType.SignIn, {
        email: 'a@a.com',
      });
      expect(sendPasscode).toHaveBeenCalled();
    });
    it('should call sendPasscode (with flow `register`)', async () => {
      const response = await sessionRequest
        .post('/session/passwordless/email/send')
        .send({ email: 'a@a.com', flow: PasscodeType.Register });
      expect(response.statusCode).toEqual(204);
      expect(createPasscode).toHaveBeenCalledWith('jti', PasscodeType.Register, {
        email: 'a@a.com',
      });
      expect(sendPasscode).toHaveBeenCalled();
    });
    it('throw when email not given in input params', async () => {
      const response = await sessionRequest
        .post('/session/passwordless/email/send')
        .send({ flow: PasscodeType.Register });
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('POST /session/passwordless/sms/verify', () => {
    beforeEach(() => {
      interactionDetails.mockResolvedValueOnce({
        jti: 'jti',
      });
    });
    afterEach(() => {
      jest.useRealTimers();
      jest.clearAllMocks();
      jest.resetModules();
    });
    it('should call interactionResult (with flow `sign-in`)', async () => {
      const fakeTime = new Date();
      jest.useFakeTimers().setSystemTime(fakeTime);
      const response = await sessionRequest
        .post('/session/passwordless/sms/verify')
        .send({ phone: '13000000000', code: '1234', flow: PasscodeType.SignIn });
      expect(response.statusCode).toEqual(204);
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          verification: {
            flow: PasscodeType.SignIn,
            phone: '13000000000',
            expiresAt: dayjs(fakeTime).add(verificationTimeout, 'second').toISOString(),
          },
        })
      );
    });
    it('should call interactionResult (with flow `register`)', async () => {
      const fakeTime = new Date();
      jest.useFakeTimers().setSystemTime(fakeTime);
      const response = await sessionRequest
        .post('/session/passwordless/sms/verify')
        .send({ phone: '13000000000', code: '1234', flow: PasscodeType.Register });
      expect(response.statusCode).toEqual(204);
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          verification: {
            flow: PasscodeType.Register,
            phone: '13000000000',
            expiresAt: dayjs(fakeTime).add(verificationTimeout, 'second').toISOString(),
          },
        })
      );
    });
    it('throw when code is wrong', async () => {
      const response = await sessionRequest
        .post('/session/passwordless/sms/verify')
        .send({ phone: '13000000000', code: '1231', flow: PasscodeType.SignIn });
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('POST /session/passwordless/email/verify', () => {
    beforeEach(() => {
      interactionDetails.mockResolvedValueOnce({
        jti: 'jti',
      });
    });
    afterEach(() => {
      jest.useRealTimers();
      jest.clearAllMocks();
      jest.resetModules();
    });
    it('should call interactionResult (with flow `sign-in`)', async () => {
      const fakeTime = new Date();
      jest.useFakeTimers().setSystemTime(fakeTime);
      const response = await sessionRequest
        .post('/session/passwordless/email/verify')
        .send({ email: 'a@a.com', code: '1234', flow: PasscodeType.SignIn });
      expect(response.statusCode).toEqual(204);
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          verification: {
            flow: PasscodeType.SignIn,
            email: 'a@a.com',
            expiresAt: dayjs(fakeTime).add(verificationTimeout, 'second').toISOString(),
          },
        })
      );
    });
    it('should call interactionResult (with flow `register`)', async () => {
      const fakeTime = new Date();
      jest.useFakeTimers().setSystemTime(fakeTime);
      const response = await sessionRequest
        .post('/session/passwordless/email/verify')
        .send({ email: 'a@a.com', code: '1234', flow: PasscodeType.Register });
      expect(response.statusCode).toEqual(204);
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          verification: {
            flow: PasscodeType.Register,
            email: 'a@a.com',
            expiresAt: dayjs(fakeTime).add(verificationTimeout, 'second').toISOString(),
          },
        })
      );
    });
    it('throw when code is wrong', async () => {
      const response = await sessionRequest
        .post('/session/passwordless/email/verify')
        .send({ email: 'a@a.com', code: '1231', flow: PasscodeType.SignIn });
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('POST /session/sign-in/passwordless/sms', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should call interactionResult', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            phone: '13000000000',
            flow: PasscodeType.SignIn,
            expiresAt: dayjs().add(1, 'day').toISOString(),
          },
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/sms`);
      expect(response.statusCode).toEqual(200);
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          login: { accountId: 'id' },
        }),
        expect.anything()
      );
    });
    it('throw when verification session invalid', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            phone: '13000000000',
            expiresAt: dayjs().add(1, 'day').toISOString(),
          },
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/sms`);
      expect(response.statusCode).toEqual(404);
    });
    it('throw when flow is not `sign-in`', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            phone: '13000000000',
            flow: PasscodeType.Register,
            expiresAt: dayjs().add(1, 'day').toISOString(),
          },
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/sms`);
      expect(response.statusCode).toEqual(401);
    });
    it('throw when expiresAt is not valid ISO date string', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            phone: '13000000000',
            flow: PasscodeType.SignIn,
            expiresAt: 'invalid date string',
          },
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/sms`);
      expect(response.statusCode).toEqual(401);
    });
    it('throw when validation expired', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            phone: '13000000000',
            flow: PasscodeType.SignIn,
            expiresAt: dayjs().subtract(1, 'day').toISOString(),
          },
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/sms`);
      expect(response.statusCode).toEqual(401);
    });
    it('throw when phone not exist', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            flow: PasscodeType.SignIn,
            expiresAt: dayjs().add(1, 'day').toISOString(),
          },
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/sms`);
      expect(response.statusCode).toEqual(401);
    });
    it("throw when phone not exist as user's primaryPhone", async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            phone: '13000000001',
            flow: PasscodeType.SignIn,
            expiresAt: dayjs().add(1, 'day').toISOString(),
          },
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/sms`);
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/sign-in/passwordless/email', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should call interactionResult', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            email: 'a@a.com',
            flow: PasscodeType.SignIn,
            expiresAt: dayjs().add(1, 'day').toISOString(),
          },
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/email`);
      expect(response.statusCode).toEqual(200);
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          login: { accountId: 'id' },
        }),
        expect.anything()
      );
    });
    it('throw when verification session invalid', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            email: 'a@a.com',
            expiresAt: dayjs().add(1, 'day').toISOString(),
          },
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/email`);
      expect(response.statusCode).toEqual(404);
    });
    it('throw when flow is not `sign-in`', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            email: 'a@a.com',
            flow: PasscodeType.Register,
            expiresAt: dayjs().add(1, 'day').toISOString(),
          },
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/email`);
      expect(response.statusCode).toEqual(401);
    });
    it('throw when email not exist', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            flow: PasscodeType.SignIn,
            expiresAt: dayjs().add(1, 'day').toISOString(),
          },
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/email`);
      expect(response.statusCode).toEqual(401);
    });
    it("throw when email not exist as user's primaryEmail", async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            email: 'b@a.com',
            flow: PasscodeType.SignIn,
            expiresAt: dayjs().add(1, 'day').toISOString(),
          },
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/email`);
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/register/passwordless/sms', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should call interactionResult', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            phone: '13000000001',
            flow: PasscodeType.Register,
            expiresAt: dayjs().add(1, 'day').toISOString(),
          },
        },
      });
      const response = await sessionRequest.post(`${registerRoute}/sms`);
      expect(response.statusCode).toEqual(200);
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          login: { accountId: 'user1' },
        }),
        expect.anything()
      );
    });
    it('throw when verification session invalid', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            phone: '13000000001',
            expiresAt: dayjs().add(1, 'day').toISOString(),
          },
        },
      });
      const response = await sessionRequest.post(`${registerRoute}/sms`);
      expect(response.statusCode).toEqual(404);
    });
    it('throw when flow is not `register`', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            phone: '13000000001',
            flow: PasscodeType.SignIn,
            expiresAt: dayjs().add(1, 'day').toISOString(),
          },
        },
      });
      const response = await sessionRequest.post(`${registerRoute}/sms`);
      expect(response.statusCode).toEqual(401);
    });
    it('throw when phone not exist', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            flow: PasscodeType.Register,
            expiresAt: dayjs().add(1, 'day').toISOString(),
          },
        },
      });
      const response = await sessionRequest.post(`${registerRoute}/sms`);
      expect(response.statusCode).toEqual(401);
    });
    it("throw when phone already exist as user's primaryPhone", async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            phone: '13000000000',
            flow: PasscodeType.Register,
            expiresAt: dayjs().add(1, 'day').toISOString(),
          },
        },
      });
      const response = await sessionRequest.post(`${registerRoute}/sms`);
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/register/passwordless/email', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    it('should call interactionResult', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            email: 'b@a.com',
            flow: PasscodeType.Register,
            expiresAt: dayjs().add(1, 'day').toISOString(),
          },
        },
      });
      const response = await sessionRequest.post(`${registerRoute}/email`);
      expect(response.statusCode).toEqual(200);
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          login: { accountId: 'user1' },
        }),
        expect.anything()
      );
    });
    it('throw when verification session invalid', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            email: 'b@a.com',
            expiresAt: dayjs().add(1, 'day').toISOString(),
          },
        },
      });
      const response = await sessionRequest.post(`${registerRoute}/email`);
      expect(response.statusCode).toEqual(404);
    });
    it('throw when flow is not `register`', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            email: 'b@a.com',
            flow: PasscodeType.SignIn,
            expiresAt: dayjs().add(1, 'day').toISOString(),
          },
        },
      });
      const response = await sessionRequest.post(`${registerRoute}/email`);
      expect(response.statusCode).toEqual(401);
    });
    it('throw when email not exist', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            flow: PasscodeType.Register,
            expiresAt: dayjs().add(1, 'day').toISOString(),
          },
        },
      });
      const response = await sessionRequest.post(`${registerRoute}/email`);
      expect(response.statusCode).toEqual(401);
    });
    it("throw when email already exist as user's primaryEmail", async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            email: 'a@a.com',
            flow: PasscodeType.Register,
            expiresAt: dayjs().add(1, 'day').toISOString(),
          },
        },
      });
      const response = await sessionRequest.post(`${registerRoute}/email`);
      expect(response.statusCode).toEqual(422);
    });
  });
});
/* eslint-enable max-lines */
