import { Provider } from 'oidc-provider';

import { createRequester } from '@/utils/test-utils';

import forgotPasswordRoutes, { forgotPasswordRoute } from './forgot-password';

jest.mock('@/queries/user', () => ({
  hasUserWithPhone: async (phone: string) => phone === '13000000000',
  hasUserWithEmail: async (email: string) => email === 'a@a.com',
}));

const sendPasscode = jest.fn(async () => ({ dbEntry: { id: 'connectorIdValue' } }));
jest.mock('@/lib/passcode', () => ({
  createPasscode: async () => ({ id: 'id' }),
  sendPasscode: async () => sendPasscode(),
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

  describe('POST /session/forgot-password/sms/send-passcode', () => {
    beforeAll(() => {
      interactionDetails.mockResolvedValueOnce({
        jti: 'jti',
      });
    });
    it('should call sendPasscode', async () => {
      const response = await sessionRequest
        .post(`${forgotPasswordRoute}/sms/send-passcode`)
        .send({ phone: '13000000000' });
      expect(response.statusCode).toEqual(204);
      expect(sendPasscode).toHaveBeenCalled();
    });
    it('throw error if phone does not exist', async () => {
      const response = await sessionRequest
        .post(`${forgotPasswordRoute}/sms/send-passcode`)
        .send({ phone: '13000000001' });
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/forgot-password/email/send-passcode', () => {
    beforeAll(() => {
      interactionDetails.mockResolvedValueOnce({
        jti: 'jti',
      });
    });
    it('should call sendPasscode', async () => {
      const response = await sessionRequest
        .post(`${forgotPasswordRoute}/email/send-passcode`)
        .send({ email: 'a@a.com' });
      expect(response.statusCode).toEqual(204);
      expect(sendPasscode).toHaveBeenCalled();
    });
    it('throw error if email does not exist', async () => {
      const response = await sessionRequest
        .post(`${forgotPasswordRoute}/email/send-passcode`)
        .send({ email: 'b@a.com' });
      expect(response.statusCode).toEqual(422);
    });
  });
});
