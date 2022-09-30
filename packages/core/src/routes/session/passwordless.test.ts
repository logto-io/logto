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
        .send({ phone: '13000000000', flow: 'sign-in' });
      expect(response.statusCode).toEqual(204);
      expect(createPasscode).toHaveBeenCalledWith('jti', PasscodeType.SignIn, {
        phone: '13000000000',
      });
      expect(sendPasscode).toHaveBeenCalled();
    });
    it('should call sendPasscode (with flow `register`)', async () => {
      const response = await sessionRequest
        .post('/session/passwordless/sms/send')
        .send({ phone: '13000000000', flow: 'register' });
      expect(response.statusCode).toEqual(204);
      expect(createPasscode).toHaveBeenCalledWith('jti', PasscodeType.Register, {
        phone: '13000000000',
      });
      expect(sendPasscode).toHaveBeenCalled();
    });
    it('throw when phone not given in input params', async () => {
      const response = await sessionRequest
        .post('/session/passwordless/sms/send')
        .send({ flow: 'register' });
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
        .send({ email: 'a@a.com', flow: 'sign-in' });
      expect(response.statusCode).toEqual(204);
      expect(createPasscode).toHaveBeenCalledWith('jti', PasscodeType.SignIn, {
        email: 'a@a.com',
      });
      expect(sendPasscode).toHaveBeenCalled();
    });
    it('should call sendPasscode (with flow `register`)', async () => {
      const response = await sessionRequest
        .post('/session/passwordless/email/send')
        .send({ email: 'a@a.com', flow: 'register' });
      expect(response.statusCode).toEqual(204);
      expect(createPasscode).toHaveBeenCalledWith('jti', PasscodeType.Register, {
        email: 'a@a.com',
      });
      expect(sendPasscode).toHaveBeenCalled();
    });
    it('throw when email not given in input params', async () => {
      const response = await sessionRequest
        .post('/session/passwordless/email/send')
        .send({ flow: 'register' });
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
        .send({ phone: '13000000000', code: '1234', flow: 'sign-in' });
      expect(response.statusCode).toEqual(204);
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          verification: {
            flow: 'sign-in',
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
        .send({ phone: '13000000000', code: '1234', flow: 'register' });
      expect(response.statusCode).toEqual(204);
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          verification: {
            flow: 'register',
            phone: '13000000000',
            expiresAt: dayjs(fakeTime).add(verificationTimeout, 'second').toISOString(),
          },
        })
      );
    });
    it('throw when code is wrong', async () => {
      const response = await sessionRequest
        .post('/session/passwordless/sms/verify')
        .send({ phone: '13000000000', code: '1231', flow: 'sign-in' });
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
        .send({ email: 'a@a.com', code: '1234', flow: 'sign-in' });
      expect(response.statusCode).toEqual(204);
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          verification: {
            flow: 'sign-in',
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
        .send({ email: 'a@a.com', code: '1234', flow: 'register' });
      expect(response.statusCode).toEqual(204);
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          verification: {
            flow: 'register',
            email: 'a@a.com',
            expiresAt: dayjs(fakeTime).add(verificationTimeout, 'second').toISOString(),
          },
        })
      );
    });
    it('throw when code is wrong', async () => {
      const response = await sessionRequest
        .post('/session/passwordless/email/verify')
        .send({ email: 'a@a.com', code: '1231', flow: 'sign-in' });
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('POST /session/sign-in/passwordless/sms/send-passcode', () => {
    beforeAll(() => {
      interactionDetails.mockResolvedValueOnce({
        jti: 'jti',
      });
    });
    it('should call sendPasscode', async () => {
      const response = await sessionRequest
        .post(`${signInRoute}/sms/send-passcode`)
        .send({ phone: '13000000000' });
      expect(response.statusCode).toEqual(204);
      expect(sendPasscode).toHaveBeenCalled();
    });
    it('throw error if phone does not exist', async () => {
      const response = await sessionRequest
        .post(`${signInRoute}/sms/send-passcode`)
        .send({ phone: '13000000001' });
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/sign-in/passwordless/sms/verify-passcode', () => {
    it('assign result and redirect', async () => {
      const response = await sessionRequest
        .post(`${signInRoute}/sms/verify-passcode`)
        .send({ phone: '13000000000', code: '1234' });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('redirectTo');
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ login: { accountId: 'id' } }),
        expect.anything()
      );
    });
    it('throw error if phone does not exist', async () => {
      const response = await sessionRequest
        .post(`${signInRoute}/sms/verify-passcode`)
        .send({ phone: '13000000001', code: '1234' });
      expect(response.statusCode).toEqual(422);
    });
    it('throw error if verifyPasscode failed', async () => {
      const response = await sessionRequest
        .post(`${signInRoute}/sms/verify-passcode`)
        .send({ phone: '13000000000', code: '1231' });
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('POST /session/sign-in/passwordless/email/send-passcode', () => {
    beforeAll(() => {
      interactionDetails.mockResolvedValue({
        jti: 'jti',
      });
    });
    it('should call sendPasscode', async () => {
      const response = await sessionRequest
        .post(`${signInRoute}/email/send-passcode`)
        .send({ email: 'a@a.com' });
      expect(response.statusCode).toEqual(204);
      expect(sendPasscode).toHaveBeenCalled();
    });
    it('throw error if email does not exist', async () => {
      const response = await sessionRequest
        .post(`${signInRoute}/email/send-passcode`)
        .send({ email: 'b@a.com' });
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/sign-in/passwordless/email/verify-passcode', () => {
    it('assign result and redirect', async () => {
      const response = await sessionRequest
        .post(`${signInRoute}/email/verify-passcode`)
        .send({ email: 'a@a.com', code: '1234' });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('redirectTo');
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ login: { accountId: 'id' } }),
        expect.anything()
      );
    });
    it('throw error if email does not exist', async () => {
      const response = await sessionRequest
        .post(`${signInRoute}/email/send-passcode`)
        .send({ email: 'b@a.com' });
      expect(response.statusCode).toEqual(422);
    });
    it('throw error if verifyPasscode failed', async () => {
      const response = await sessionRequest
        .post(`${signInRoute}/email/verify-passcode`)
        .send({ email: 'a@a.com', code: '1231' });
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('POST /session/register/passwordless/sms/send-passcode', () => {
    beforeAll(() => {
      interactionDetails.mockResolvedValueOnce({
        jti: 'jti',
      });
    });

    it('should call sendPasscode', async () => {
      const response = await sessionRequest
        .post(`${registerRoute}/sms/send-passcode`)
        .send({ phone: '13000000001' });
      expect(response.statusCode).toEqual(204);
      expect(sendPasscode).toHaveBeenCalled();
    });

    it('throw error if phone not valid (charactors other than digits)', async () => {
      const response = await sessionRequest
        .post(`${registerRoute}/sms/send-passcode`)
        .send({ phone: '1300000000a' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if phone not valid (without digits)', async () => {
      const response = await sessionRequest
        .post(`${registerRoute}/sms/send-passcode`)
        .send({ phone: 'abcdefg' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if phone exists', async () => {
      const response = await sessionRequest
        .post(`${registerRoute}/sms/send-passcode`)
        .send({ phone: '13000000000' });
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/register/passwordless/sms/verify-passcode', () => {
    it('assign result and redirect', async () => {
      const response = await sessionRequest
        .post(`${registerRoute}/sms/verify-passcode`)
        .send({ phone: '13000000001', code: '1234' });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('redirectTo');
      expect(insertUser).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user1', primaryPhone: '13000000001' })
      );
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ login: { accountId: 'user1' } }),
        expect.anything()
      );
    });

    it('throw error if phone is invalid (characters other than digits)', async () => {
      const response = await sessionRequest
        .post(`${registerRoute}/sms/verify-passcode`)
        .send({ phone: '1300000000a', code: '1234' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if phone not valid (without digits)', async () => {
      const response = await sessionRequest
        .post(`${registerRoute}/sms/verify-passcode`)
        .send({ phone: 'abcdefg', code: '1234' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if phone exists', async () => {
      const response = await sessionRequest
        .post(`${registerRoute}/sms/verify-passcode`)
        .send({ phone: '13000000000', code: '1234' });
      expect(response.statusCode).toEqual(422);
    });

    it('throw error if verifyPasscode failed', async () => {
      const response = await sessionRequest
        .post(`${registerRoute}/sms/verify-passcode`)
        .send({ phone: '13000000001', code: '1231' });
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('POST /session/register/passwordless/email/send-passcode', () => {
    beforeAll(() => {
      interactionDetails.mockResolvedValueOnce({
        jti: 'jti',
      });
    });

    it('should call sendPasscode', async () => {
      const response = await sessionRequest
        .post(`${registerRoute}/email/send-passcode`)
        .send({ email: 'b@a.com' });
      expect(response.statusCode).toEqual(204);
      expect(sendPasscode).toHaveBeenCalled();
    });

    it('throw error if email not valid', async () => {
      const response = await sessionRequest
        .post(`${registerRoute}/email/send-passcode`)
        .send({ email: 'aaa.com' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if email exists', async () => {
      const response = await sessionRequest
        .post(`${registerRoute}/email/send-passcode`)
        .send({ email: 'a@a.com' });
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/register/passwordless/email/verify-passcode', () => {
    it('assign result and redirect', async () => {
      const response = await sessionRequest
        .post(`${registerRoute}/email/verify-passcode`)
        .send({ email: 'b@a.com', code: '1234' });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('redirectTo');
      expect(insertUser).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user1', primaryEmail: 'b@a.com' })
      );
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ login: { accountId: 'user1' } }),
        expect.anything()
      );
    });

    it('throw error if email not valid', async () => {
      const response = await sessionRequest
        .post(`${signInRoute}/email/send-passcode`)
        .send({ email: 'aaa.com' });
      expect(response.statusCode).toEqual(400);
    });

    it('throw error if email exist', async () => {
      const response = await sessionRequest
        .post(`${signInRoute}/email/send-passcode`)
        .send({ email: 'b@a.com' });
      expect(response.statusCode).toEqual(422);
    });

    it('throw error if verifyPasscode failed', async () => {
      const response = await sessionRequest
        .post(`${signInRoute}/email/verify-passcode`)
        .send({ email: 'a@a.com', code: '1231' });
      expect(response.statusCode).toEqual(400);
    });
  });
});
/* eslint-enable max-lines */
