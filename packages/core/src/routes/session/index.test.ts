import type { User } from '@logto/schemas';
import { adminConsoleApplicationId } from '@logto/schemas/lib/seeds/index.js';
import { Provider } from 'oidc-provider';
import Sinon from 'sinon';

import { mockUser } from '#src/__mocks__/index.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const findUserById = jest.fn(async (): Promise<User> => mockUser);
const updateUserById = jest.fn(async (..._args: unknown[]) => ({ id: 'id' }));

const grantSave = jest.fn(async () => 'finalGrantId');
const grantAddOIDCScope = jest.fn();
const grantAddResourceScope = jest.fn();

const queries = await import('#src/queries/user.js');

jest.unstable_mockModule('#src/queries/user.js', () => ({
  ...queries,
  findUserById: async () => findUserById(),
  updateUserById: async (...args: unknown[]) => updateUserById(...args),
}));

const { default: sessionRoutes } = await import('./index.js');

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

describe('sessionRoutes', () => {
  const provider = new Provider('https://logto.test');
  Sinon.stub(provider, 'Grant').value(Grant);
  // @ts-expect-error for testing
  const interactionDetails = jest.spyOn(provider, 'interactionDetails').mockResolvedValue({});
  const interactionResult = jest
    .spyOn(provider, 'interactionResult')
    .mockResolvedValue('redirectTo');

  const sessionRequest = createRequester({
    anonymousRoutes: sessionRoutes,
    provider,
    middlewares: [
      async (ctx, next) => {
        ctx.addLogContext = jest.fn();
        ctx.log = jest.fn();

        return next();
      },
    ],
  });

  afterEach(() => {
    grantSave.mockClear();
    interactionResult.mockClear();
  });

  describe('POST /session', () => {
    it('should redirect to /session/consent with consent prompt name', async () => {
      interactionDetails.mockResolvedValueOnce({
        // @ts-expect-error for testing
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
        // @ts-expect-error for testing
        prompt: { name: 'invalid' },
      });
      await expect(sessionRequest.post('/session').send({})).resolves.toHaveProperty('status', 400);
    });
  });

  describe('POST /session/consent', () => {
    describe('should call grant.save() and assign interaction results', () => {
      afterEach(() => {
        updateUserById.mockClear();
      });

      it('with empty details and reusing old grant', async () => {
        interactionDetails.mockResolvedValueOnce({
          // @ts-expect-error for testing
          session: { accountId: 'accountId' },
          params: { client_id: 'clientId' },
          // @ts-expect-error for testing
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
          // @ts-expect-error for testing
          session: { accountId: 'accountId' },
          params: { client_id: 'clientId' },
          // @ts-expect-error for testing
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

      it('should save application id when the user first consented', async () => {
        interactionDetails.mockResolvedValueOnce({
          // @ts-expect-error for testing
          session: { accountId: mockUser.id },
          params: { client_id: 'clientId' },
          prompt: {
            name: 'consent',
            details: {},
            reasons: ['consent_prompt', 'native_client_prompt'],
          },
          grantId: 'grantId',
        });

        findUserById.mockImplementationOnce(async () => ({ ...mockUser, applicationId: null }));

        const response = await sessionRequest.post('/session/consent');

        expect(updateUserById).toHaveBeenCalledWith(mockUser.id, { applicationId: 'clientId' });
        expect(response.statusCode).toEqual(200);
      });

      it('missingOIDCScope and missingResourceScopes', async () => {
        interactionDetails.mockResolvedValueOnce({
          // @ts-expect-error for testing
          session: { accountId: 'accountId' },
          params: { client_id: 'clientId' },
          // @ts-expect-error for testing
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

    it('should throw is non-admin user request for AC consent', async () => {
      interactionDetails.mockResolvedValueOnce({
        // @ts-expect-error for testing
        session: { accountId: mockUser.id },
        params: { client_id: adminConsoleApplicationId },
        prompt: {
          name: 'consent',
          details: {},
          reasons: ['consent_prompt', 'native_client_prompt'],
        },
        grantId: 'grantId',
      });

      findUserById.mockImplementationOnce(async () => ({
        ...mockUser,
        roleNames: [],
        applicationId: null,
      }));

      const response = await sessionRequest.post('/session/consent');

      expect(response.statusCode).toEqual(401);
    });

    it('throws if session is missing', async () => {
      // @ts-expect-error for testing
      interactionDetails.mockResolvedValueOnce({ params: { client_id: 'clientId' } });
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
