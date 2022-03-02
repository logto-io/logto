import { Provider } from 'oidc-provider';

import { createRequester } from '@/utils/test-utils';

import sessionRoutes from './session';

jest.mock('@/lib/user', () => ({
  async findUserByUsernameAndPassword(username: string) {
    if (username === 'notexistuser') {
      throw new Error(' ');
    }

    return { id: 'user1' };
  },
}));
jest.mock('@/lib/social', () => ({
  ...jest.requireActual('@/lib/social'),
  async findSocialRelatedUser() {
    return ['phone', { id: 'user1', identities: {} }];
  },
}));
const updateUserById = jest.fn(async (..._args: unknown[]) => ({ id: 'id' }));
jest.mock('@/queries/user', () => ({
  findUserById: async () => ({ id: 'id' }),
  findUserByPhone: async () => ({ id: 'id' }),
  findUserByEmail: async () => ({ id: 'id' }),
  updateUserById: async (...args: unknown[]) => updateUserById(...args),
  hasUserWithPhone: async (phone: string) => phone === '13000000000',
  hasUserWithEmail: async (email: string) => email === 'a@a.com',
}));
const sendPasscode = jest.fn();
jest.mock('@/lib/passcode', () => ({
  createPasscode: async () => ({ id: 'id' }),
  sendPasscode: () => {
    sendPasscode();
  },
  verifyPasscode: async (_a: unknown, _b: unknown, code: string) => {
    if (code !== '1234') {
      throw new Error(' ');
    }
  },
}));

const grantSave = jest.fn(async () => 'finalGrantId');
const grantAddOIDCScope = jest.fn();
const grantAddResourceScope = jest.fn();
const interactionResult = jest.fn(async () => 'redirectTo');
const interactionDetails: jest.MockedFunction<() => Promise<unknown>> = jest.fn(async () => ({}));

class Grant {
  static async find(id: string) {
    return id === 'exists' ? new Grant() : undefined;
  }

  save: typeof grantSave;
  addOIDCScope: typeof grantAddOIDCScope;
  addResourceScope: typeof grantAddResourceScope;

  constructor() {
    this.save = grantSave;
    this.addOIDCScope = grantAddOIDCScope;
    this.addResourceScope = grantAddResourceScope;
  }
}

jest.mock('oidc-provider', () => ({
  Provider: jest.fn(() => ({
    Grant,
    interactionDetails,
    interactionResult,
  })),
}));

afterEach(() => {
  grantSave.mockClear();
  interactionResult.mockClear();
});

describe('sessionRoutes', () => {
  const sessionRequest = createRequester({
    anonymousRoutes: sessionRoutes,
    provider: new Provider(''),
    middlewares: [
      async (ctx, next) => {
        ctx.userLog = {};

        return next();
      },
    ],
  });

  describe('POST /session', () => {
    it('should redirect to /session/consent with consent prompt name', async () => {
      interactionDetails.mockResolvedValueOnce({
        prompt: { name: 'consent' },
      });
      const response = await sessionRequest.post('/session');

      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty(
        'redirectTo',
        expect.stringContaining('/session/consent')
      );
    });

    it('throw error with other prompt name', async () => {
      interactionDetails.mockResolvedValueOnce({
        prompt: { name: 'invalid' },
      });
      await expect(sessionRequest.post('/session').send({})).resolves.toHaveProperty('status', 400);
    });
  });

  describe('POST /session/sign-in/username-password', () => {
    it('assign result and redirect', async () => {
      const response = await sessionRequest.post('/session/sign-in/username-password').send({
        username: 'username',
        password: 'password',
      });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toHaveProperty('redirectTo');
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ login: { accountId: 'user1' } }),
        expect.anything()
      );
    });

    it('throw if user not found', async () => {
      const response = await sessionRequest.post('/session/sign-in/username-password').send({
        username: 'notexistuser',
        password: 'password',
      });
      expect(response.statusCode).toEqual(500);
    });
  });

  describe('POST /session/sign-in/passwordless/phone/send-passcode', () => {
    beforeAll(() => {
      interactionDetails.mockResolvedValueOnce({
        jti: 'jti',
      });
    });
    it('call sendPasscode', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/phone/send-passcode')
        .send({ phone: '13000000000' });
      expect(response.statusCode).toEqual(204);
      expect(sendPasscode).toHaveBeenCalled();
    });
    it('throw error if phone not exists', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/phone/send-passcode')
        .send({ phone: '13000000001' });
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/sign-in/passwordless/phone/verify-passcode', () => {
    it('assign result and redirect', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/phone/verify-passcode')
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
    it('throw error if phone not exists', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/phone/send-passcode')
        .send({ phone: '13000000001' });
      expect(response.statusCode).toEqual(422);
    });
    it('throw error if verifyPasscode failed', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/phone/verify-passcode')
        .send({ phone: '13000000000', code: '1231' });
      expect(response.statusCode).toEqual(500);
    });
  });

  describe('POST /session/sign-in/passwordless/email/send-passcode', () => {
    beforeAll(() => {
      interactionDetails.mockResolvedValue({
        jti: 'jti',
      });
    });
    it('call sendPasscode', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/email/send-passcode')
        .send({ email: 'a@a.com' });
      expect(response.statusCode).toEqual(204);
      expect(sendPasscode).toHaveBeenCalled();
    });
    it('throw error if email not exists', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/email/send-passcode')
        .send({ email: 'b@a.com' });
      expect(response.statusCode).toEqual(422);
    });
  });

  describe('POST /session/sign-in/passwordless/email/verify-passcode', () => {
    it('assign result and redirect', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/email/verify-passcode')
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
    it('throw error if verifyPasscode failed', async () => {
      const response = await sessionRequest
        .post('/session/sign-in/passwordless/email/verify-passcode')
        .send({ email: 'a@a.com', code: '1231' });
      expect(response.statusCode).toEqual(500);
    });
  });

  describe('POST /session/sign-in/bind-social-related-user', () => {
    it('throw if session is not authorized', async () => {
      await expect(
        sessionRequest
          .post('/session/sign-in/bind-social-related-user')
          .send({ connectorId: 'connectorId' })
      ).resolves.toHaveProperty('statusCode', 400);
    });
    it('throw if no social info in session', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: { login: { accountId: 'user1' } },
      });
      await expect(
        sessionRequest
          .post('/session/sign-in/bind-social-related-user')
          .send({ connectorId: 'connectorId' })
      ).resolves.toHaveProperty('statusCode', 400);
    });
    it('updates user identities and sign in', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          login: { accountId: 'user1' },
          socialUserInfo: {
            connectorId: 'connectorId',
            userInfo: { id: 'connectorUser', phone: 'phone' },
          },
        },
      });
      const response = await sessionRequest.post('/session/sign-in/bind-social-related-user').send({
        connectorId: 'connectorId',
      });
      expect(response.statusCode).toEqual(200);
      expect(updateUserById).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          identities: {
            connectorId: {
              details: { id: 'connectorUser', phone: 'phone' },
              userId: 'connectorUser',
            },
          },
        })
      );
      expect(response.body).toHaveProperty('redirectTo');
      expect(interactionResult).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ login: { accountId: 'user1' } }),
        expect.anything()
      );
    });
  });

  describe('POST /session/bind-social', () => {
    it('throw if session is not authorized', async () => {
      interactionDetails.mockResolvedValueOnce({});
      await expect(
        sessionRequest.post('/session/bind-social').send({ connectorId: 'connectorId' })
      ).resolves.toHaveProperty('statusCode', 400);
    });
    it('throw if no social info in session', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: { login: { accountId: 'user1' } },
      });
      await expect(
        sessionRequest.post('/session/bind-social').send({ connectorId: 'connectorId' })
      ).resolves.toHaveProperty('statusCode', 400);
    });
    it('updates user identities', async () => {
      interactionDetails.mockResolvedValueOnce({
        result: {
          login: { accountId: 'user1' },
          socialUserInfo: {
            connectorId: 'connectorId',
            userInfo: { id: 'connectorUser', phone: 'phone' },
          },
        },
      });
      const response = await sessionRequest.post('/session/bind-social').send({
        connectorId: 'connectorId',
      });
      expect(response.statusCode).toEqual(200);
      expect(updateUserById).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          identities: {
            connectorId: {
              details: { id: 'connectorUser', phone: 'phone' },
              userId: 'connectorUser',
            },
          },
        })
      );
    });
  });

  describe('POST /session/consent', () => {
    describe('should call grant.save() and assign interaction results', () => {
      it('with empty details and reusing old grant', async () => {
        interactionDetails.mockResolvedValueOnce({
          session: { accountId: 'accountId' },
          params: { client_id: 'clientId' },
          prompt: { details: {} },
        });
        const response = await sessionRequest.post('/session/consent');
        expect(response.statusCode).toEqual(200);
        expect(grantSave).toHaveBeenCalled();
        expect(interactionResult).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({
            consent: { grantId: 'finalGrantId' },
          }),
          expect.anything()
        );
      });
      it('with empty details and creating new grant', async () => {
        interactionDetails.mockResolvedValueOnce({
          session: { accountId: 'accountId' },
          params: { client_id: 'clientId' },
          prompt: { details: {} },
          grantId: 'exists',
        });
        const response = await sessionRequest.post('/session/consent');
        expect(response.statusCode).toEqual(200);
        expect(grantSave).toHaveBeenCalled();
        expect(interactionResult).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({
            consent: { grantId: 'finalGrantId' },
          }),
          expect.anything()
        );
      });
      it('missingOIDCScope and missingResourceScopes', async () => {
        interactionDetails.mockResolvedValueOnce({
          session: { accountId: 'accountId' },
          params: { client_id: 'clientId' },
          prompt: {
            details: {
              missingOIDCScope: ['scope1', 'scope2'],
              missingResourceScopes: {
                resource1: ['scope1', 'scope2'],
                resource2: ['scope3'],
              },
            },
          },
        });
        const response = await sessionRequest.post('/session/consent');
        expect(response.statusCode).toEqual(200);
        expect(grantAddOIDCScope).toHaveBeenCalledWith('scope1 scope2');
        expect(grantAddResourceScope).toHaveBeenCalledWith('resource1', 'scope1 scope2');
        expect(grantAddResourceScope).toHaveBeenCalledWith('resource2', 'scope3');
        expect(interactionResult).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.objectContaining({
            consent: { grantId: 'finalGrantId' },
          }),
          expect.anything()
        );
      });
    });
    it('throws if session is missing', async () => {
      interactionDetails.mockResolvedValueOnce({});
      await expect(sessionRequest.post('/session/consent')).resolves.toHaveProperty(
        'statusCode',
        400
      );
    });
  });

  it('DELETE /session', async () => {
    const response = await sessionRequest.delete('/session');
    expect(response.body).toHaveProperty('redirectTo');
    expect(interactionResult).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ error: 'oidc.aborted' }),
      expect.anything()
    );
  });
});
