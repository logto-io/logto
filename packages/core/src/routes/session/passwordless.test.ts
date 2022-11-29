/* eslint-disable max-lines */
import type { User } from '@logto/schemas';
import { PasscodeType, SignInExperienceIdentifier } from '@logto/schemas';
import type { Nullable } from '@silverhand/essentials';
import { addDays, addSeconds, subDays } from 'date-fns';
import { Provider } from 'oidc-provider';

import { mockSignInExperience, mockSignInMethod, mockUser } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { createRequester } from '#src/utils/test-utils.js';

import { verificationTimeout } from './consts.js';
import * as passwordlessActions from './middleware/passwordless-action.js';
import passwordlessRoutes, { registerRoute, signInRoute } from './passwordless.js';

const insertUser = jest.fn(async (..._args: unknown[]) => mockUser);
const findUserById = jest.fn(async (): Promise<User> => mockUser);
const findUserByEmail = jest.fn(async (): Promise<Nullable<User>> => mockUser);
const findUserByPhone = jest.fn(async (): Promise<Nullable<User>> => mockUser);
const updateUserById = jest.fn(async (..._args: unknown[]) => mockUser);
const findDefaultSignInExperience = jest.fn(async () => ({
  ...mockSignInExperience,
  signUp: {
    ...mockSignInExperience.signUp,
    identifiers: [SignInExperienceIdentifier.Username],
    password: false,
    verify: true,
  },
}));
const getTomorrowIsoString = () => addDays(Date.now(), 1).toISOString();

jest.mock('#src/lib/user.js', () => ({
  generateUserId: () => 'user1',
  insertUser: async (...args: unknown[]) => insertUser(...args),
}));

jest.mock('#src/lib/session.js', () => ({
  ...jest.requireActual('#src/lib/session.js'),
  getApplicationIdFromInteraction: jest.fn(),
}));

jest.mock('#src/queries/user.js', () => ({
  findUserById: async () => findUserById(),
  findUserByPhone: async () => findUserByPhone(),
  findUserByEmail: async () => findUserByEmail(),
  updateUserById: async (...args: unknown[]) => updateUserById(...args),
  hasUser: async (username: string) => username === 'username1',
  hasUserWithPhone: async (phone: string) => phone === '13000000000',
  hasUserWithEmail: async (email: string) => email === 'a@a.com',
}));

jest.mock('#src/queries/sign-in-experience.js', () => ({
  findDefaultSignInExperience: async () => findDefaultSignInExperience(),
}));
const smsSignInActionSpy = jest.spyOn(passwordlessActions, 'smsSignInAction');
const emailSignInActionSpy = jest.spyOn(passwordlessActions, 'emailSignInAction');
const smsRegisterActionSpy = jest.spyOn(passwordlessActions, 'smsRegisterAction');
const emailRegisterActionSpy = jest.spyOn(passwordlessActions, 'emailRegisterAction');

const sendPasscode = jest.fn(async () => ({ dbEntry: { id: 'connectorIdValue' } }));
const createPasscode = jest.fn(async (..._args: unknown[]) => ({ id: 'id' }));
jest.mock('#src/lib/passcode.js', () => ({
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
    it('should call sendPasscode (with flow `forgot-password`)', async () => {
      const response = await sessionRequest
        .post('/session/passwordless/sms/send')
        .send({ phone: '13000000000', flow: PasscodeType.ForgotPassword });
      expect(response.statusCode).toEqual(204);
      expect(createPasscode).toHaveBeenCalledWith('jti', PasscodeType.ForgotPassword, {
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
    it('should call sendPasscode (with flow `forgot-password`)', async () => {
      const response = await sessionRequest
        .post('/session/passwordless/email/send')
        .send({ email: 'a@a.com', flow: PasscodeType.ForgotPassword });
      expect(response.statusCode).toEqual(204);
      expect(createPasscode).toHaveBeenCalledWith('jti', PasscodeType.ForgotPassword, {
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
    });

    it('should call interactionResult (with flow `sign-in`)', async () => {
      const fakeTime = new Date();
      jest.useFakeTimers().setSystemTime(fakeTime);

      await sessionRequest
        .post('/session/passwordless/sms/verify')
        .send({ phone: '13000000000', code: '1234', flow: PasscodeType.SignIn });

      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          verification: {
            flow: PasscodeType.SignIn,
            phone: '13000000000',
            expiresAt: addSeconds(fakeTime, verificationTimeout).toISOString(),
          },
        })
      );

      // Should call sign-in with sms properly
      expect(smsSignInActionSpy).toBeCalled();
    });

    it('should call interactionResult (with flow `register`)', async () => {
      const fakeTime = new Date();
      jest.useFakeTimers().setSystemTime(fakeTime);

      await sessionRequest
        .post('/session/passwordless/sms/verify')
        .send({ phone: '13000000000', code: '1234', flow: PasscodeType.Register });

      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          verification: {
            flow: PasscodeType.Register,
            phone: '13000000000',
            expiresAt: addSeconds(fakeTime, verificationTimeout).toISOString(),
          },
        })
      );

      expect(smsRegisterActionSpy).toBeCalled();
    });

    it('should call interactionResult (with flow `forgot-password`)', async () => {
      const fakeTime = new Date();
      jest.useFakeTimers().setSystemTime(fakeTime);

      const response = await sessionRequest
        .post('/session/passwordless/sms/verify')
        .send({ phone: '13000000000', code: '1234', flow: PasscodeType.ForgotPassword });

      expect(response.statusCode).toEqual(204);

      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          verification: {
            userId: mockUser.id,
            expiresAt: addSeconds(fakeTime, verificationTimeout).toISOString(),
            flow: PasscodeType.ForgotPassword,
          },
        })
      );
    });

    it('throw 404 (with flow `forgot-password`)', async () => {
      findUserByPhone.mockResolvedValueOnce(null);
      const response = await sessionRequest
        .post('/session/passwordless/sms/verify')
        .send({ phone: '13000000001', code: '1234', flow: PasscodeType.ForgotPassword });
      expect(response.statusCode).toEqual(404);
      expect(interactionResult).toHaveBeenCalledTimes(0);
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
    });

    it('should call interactionResult (with flow `sign-in`)', async () => {
      const fakeTime = new Date();
      jest.useFakeTimers().setSystemTime(fakeTime);

      await sessionRequest
        .post('/session/passwordless/email/verify')
        .send({ email: 'a@a.com', code: '1234', flow: PasscodeType.SignIn });

      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          verification: {
            flow: PasscodeType.SignIn,
            email: 'a@a.com',
            expiresAt: addSeconds(fakeTime, verificationTimeout).toISOString(),
          },
        })
      );

      expect(emailSignInActionSpy).toBeCalled();
    });

    it('should call interactionResult (with flow `register`)', async () => {
      const fakeTime = new Date();
      jest.useFakeTimers().setSystemTime(fakeTime);

      await sessionRequest
        .post('/session/passwordless/email/verify')
        .send({ email: 'a@a.com', code: '1234', flow: PasscodeType.Register });

      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          verification: {
            flow: PasscodeType.Register,
            email: 'a@a.com',
            expiresAt: addSeconds(fakeTime, verificationTimeout).toISOString(),
          },
        })
      );

      expect(emailRegisterActionSpy).toBeCalled();
    });

    it('should call interactionResult (with flow `forgot-password`)', async () => {
      const fakeTime = new Date();
      jest.useFakeTimers().setSystemTime(fakeTime);

      const response = await sessionRequest
        .post('/session/passwordless/email/verify')
        .send({ email: 'a@a.com', code: '1234', flow: PasscodeType.ForgotPassword });

      expect(response.statusCode).toEqual(204);

      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          verification: {
            userId: mockUser.id,
            expiresAt: addSeconds(fakeTime, verificationTimeout).toISOString(),
            flow: PasscodeType.ForgotPassword,
          },
        })
      );
    });

    it('throw 404 (with flow `forgot-password`)', async () => {
      const fakeTime = new Date();
      jest.useFakeTimers().setSystemTime(fakeTime);
      findUserByEmail.mockResolvedValueOnce(null);
      const response = await sessionRequest
        .post('/session/passwordless/email/verify')
        .send({ email: 'b@a.com', code: '1234', flow: PasscodeType.ForgotPassword });
      expect(response.statusCode).toEqual(404);
      expect(interactionResult).toHaveBeenCalledTimes(0);
    });

    it('throw when code is wrong', async () => {
      const response = await sessionRequest
        .post('/session/passwordless/email/verify')
        .send({ email: 'a@a.com', code: '1231', flow: PasscodeType.SignIn });
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('POST /session/sign-in/passwordless/sms', () => {
    it('should call interactionResult (with flow `sign-in`)', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            phone: '13000000000',
            flow: PasscodeType.SignIn,
            expiresAt: getTomorrowIsoString(),
          },
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/sms`);

      expect(response.statusCode).toEqual(200);

      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          login: { accountId: mockUser.id },
        }),
        expect.anything()
      );
    });

    it('should call interactionResult (with flow `register`)', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            phone: '13000000000',
            flow: PasscodeType.Register,
            expiresAt: getTomorrowIsoString(),
          },
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/sms`);
      expect(response.statusCode).toEqual(200);
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          login: { accountId: mockUser.id },
        }),
        expect.anything()
      );
    });

    it('throw when verification session invalid', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            phone: '13000000000',
            expiresAt: getTomorrowIsoString(),
          },
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/sms`);
      expect(response.statusCode).toEqual(404);
    });

    it('throw when flow is not `sign-in` and `register`', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            phone: '13000000000',
            flow: PasscodeType.ForgotPassword,
            expiresAt: getTomorrowIsoString(),
          },
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/sms`);
      expect(response.statusCode).toEqual(404);
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
            expiresAt: subDays(Date.now(), 1).toISOString(),
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
            email: 'XX@foo',
            flow: PasscodeType.SignIn,
            expiresAt: getTomorrowIsoString(),
          },
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/sms`);
      expect(response.statusCode).toEqual(404);
    });

    it("throw when phone not exist as user's primaryPhone", async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            phone: '13000000001',
            flow: PasscodeType.SignIn,
            expiresAt: getTomorrowIsoString(),
          },
        },
      });
      findUserByPhone.mockResolvedValueOnce(null);
      const response = await sessionRequest.post(`${signInRoute}/sms`);
      expect(response.statusCode).toEqual(404);
    });

    it('throw when user is suspended', async () => {
      findUserByPhone.mockResolvedValueOnce({
        ...mockUser,
        isSuspended: true,
      });
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            phone: '13000000000',
            flow: PasscodeType.SignIn,
            expiresAt: getTomorrowIsoString(),
          },
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/sms`);
      expect(response.statusCode).toEqual(401);
    });

    it('throw error if sign in method is not enabled', async () => {
      findDefaultSignInExperience.mockResolvedValueOnce({
        ...mockSignInExperience,
        signIn: {
          methods: [
            {
              ...mockSignInMethod,
              identifier: SignInExperienceIdentifier.Username,
            },
          ],
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/sms`);
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/sign-in/passwordless/email', () => {
    beforeEach(() => {
      findDefaultSignInExperience.mockResolvedValue({
        ...mockSignInExperience,
        signUp: {
          ...mockSignInExperience.signUp,
          identifiers: [SignInExperienceIdentifier.Email],
          password: false,
          verify: true,
        },
      });
    });

    afterEach(() => {
      findDefaultSignInExperience.mockClear();
    });

    it('should call interactionResult (with flow `sign-in`)', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            email: 'a@a.com',
            flow: PasscodeType.SignIn,
            expiresAt: getTomorrowIsoString(),
          },
        },
      });

      const response = await sessionRequest.post(`${signInRoute}/email`);

      expect(response.statusCode).toEqual(200);
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          login: { accountId: mockUser.id },
        }),
        expect.anything()
      );
    });

    it('should call interactionResult (with flow `register`)', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            email: 'a@a.com',
            flow: PasscodeType.Register,
            expiresAt: getTomorrowIsoString(),
          },
        },
      });

      const response = await sessionRequest.post(`${signInRoute}/email`);

      expect(response.statusCode).toEqual(200);
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          login: { accountId: mockUser.id },
        }),
        expect.anything()
      );
    });

    it('throw when verification session invalid', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            email: 'a@a.com',
            expiresAt: getTomorrowIsoString(),
          },
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/email`);
      expect(response.statusCode).toEqual(404);
    });

    it('throw when flow is not `sign-in` and `register`', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            email: 'a@a.com',
            flow: PasscodeType.ForgotPassword,
            expiresAt: getTomorrowIsoString(),
          },
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/email`);
      expect(response.statusCode).toEqual(404);
    });

    it('throw when email not exist', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            flow: PasscodeType.SignIn,
            expiresAt: getTomorrowIsoString(),
          },
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/email`);
      expect(response.statusCode).toEqual(404);
    });

    it("throw when email not exist as user's primaryEmail", async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            email: 'b@a.com',
            flow: PasscodeType.SignIn,
            expiresAt: getTomorrowIsoString(),
          },
        },
      });
      findUserByEmail.mockResolvedValueOnce(null);
      const response = await sessionRequest.post(`${signInRoute}/email`);
      expect(response.statusCode).toEqual(404);
    });

    it('throw when user is suspended', async () => {
      findUserByEmail.mockResolvedValueOnce({
        ...mockUser,
        isSuspended: true,
      });
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            email: 'a@a.com',
            flow: PasscodeType.SignIn,
            expiresAt: getTomorrowIsoString(),
          },
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/email`);
      expect(response.statusCode).toEqual(401);
    });

    it('throw error if sign in method is not enabled', async () => {
      findDefaultSignInExperience.mockResolvedValueOnce({
        ...mockSignInExperience,
        signIn: {
          methods: [
            {
              ...mockSignInMethod,
              identifier: SignInExperienceIdentifier.Username,
            },
          ],
        },
      });
      const response = await sessionRequest.post(`${signInRoute}/email`);
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/register/passwordless/sms', () => {
    beforeAll(() => {
      findDefaultSignInExperience.mockResolvedValue({
        ...mockSignInExperience,
        signUp: {
          ...mockSignInExperience.signUp,
          identifiers: [SignInExperienceIdentifier.Sms],
          password: false,
        },
      });
    });

    afterAll(() => {
      findDefaultSignInExperience.mockClear();
    });

    it('should call interactionResult (with flow `register`)', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            phone: '13000000001',
            flow: PasscodeType.Register,
            expiresAt: getTomorrowIsoString(),
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

    it('should call interactionResult (with flow `sign-in`)', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            phone: '13000000001',
            flow: PasscodeType.SignIn,
            expiresAt: getTomorrowIsoString(),
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
            expiresAt: getTomorrowIsoString(),
          },
        },
      });
      const response = await sessionRequest.post(`${registerRoute}/sms`);
      expect(response.statusCode).toEqual(404);
    });

    it('throw when flow is not `register` and `sign-in`', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            phone: '13000000001',
            flow: PasscodeType.ForgotPassword,
            expiresAt: getTomorrowIsoString(),
          },
        },
      });
      const response = await sessionRequest.post(`${registerRoute}/sms`);
      expect(response.statusCode).toEqual(404);
    });

    it('throw when phone not exist', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            flow: PasscodeType.Register,
            expiresAt: getTomorrowIsoString(),
          },
        },
      });
      const response = await sessionRequest.post(`${registerRoute}/sms`);
      expect(response.statusCode).toEqual(404);
    });

    it("throw when phone already exist as user's primaryPhone", async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            phone: '13000000000',
            flow: PasscodeType.Register,
            expiresAt: getTomorrowIsoString(),
          },
        },
      });
      const response = await sessionRequest.post(`${registerRoute}/sms`);
      expect(response.statusCode).toEqual(422);
    });

    it('throws if sign up identifier does not contain phone', async () => {
      findDefaultSignInExperience.mockResolvedValueOnce({
        ...mockSignInExperience,
        signUp: {
          ...mockSignInExperience.signUp,
          identifiers: [SignInExperienceIdentifier.Email],
        },
      });

      const response = await sessionRequest.post(`${registerRoute}/sms`);
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/register/passwordless/email', () => {
    beforeAll(() => {
      findDefaultSignInExperience.mockResolvedValue({
        ...mockSignInExperience,
        signUp: {
          ...mockSignInExperience.signUp,
          identifiers: [SignInExperienceIdentifier.Email],
          password: false,
        },
      });
    });

    afterAll(() => {
      findDefaultSignInExperience.mockClear();
    });

    it('should call interactionResult (with flow `register`)', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            email: 'b@a.com',
            flow: PasscodeType.Register,
            expiresAt: getTomorrowIsoString(),
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

    it('should call interactionResult (with flow `sign-in`)', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            email: 'b@a.com',
            flow: PasscodeType.SignIn,
            expiresAt: getTomorrowIsoString(),
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
            expiresAt: getTomorrowIsoString(),
          },
        },
      });
      const response = await sessionRequest.post(`${registerRoute}/email`);
      expect(response.statusCode).toEqual(404);
    });

    it('throw when flow is not `register` and `sign-in`', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            email: 'b@a.com',
            flow: PasscodeType.ForgotPassword,
            expiresAt: getTomorrowIsoString(),
          },
        },
      });
      const response = await sessionRequest.post(`${registerRoute}/email`);
      expect(response.statusCode).toEqual(404);
    });

    it('throw when email not exist', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            flow: PasscodeType.Register,
            expiresAt: getTomorrowIsoString(),
          },
        },
      });
      const response = await sessionRequest.post(`${registerRoute}/email`);
      expect(response.statusCode).toEqual(404);
    });

    it("throw when email already exist as user's primaryEmail", async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          verification: {
            email: 'a@a.com',
            flow: PasscodeType.Register,
            expiresAt: getTomorrowIsoString(),
          },
        },
      });
      const response = await sessionRequest.post(`${registerRoute}/email`);
      expect(response.statusCode).toEqual(422);
    });

    it('throws if sign up identifier does not contain email', async () => {
      findDefaultSignInExperience.mockResolvedValueOnce({
        ...mockSignInExperience,
        signUp: {
          ...mockSignInExperience.signUp,
          identifiers: [SignInExperienceIdentifier.Sms],
        },
      });

      const response = await sessionRequest.post(`${registerRoute}/email`);
      expect(response.statusCode).toEqual(422);
    });
  });
});
/* eslint-enable max-lines */
