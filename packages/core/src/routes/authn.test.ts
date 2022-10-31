import RequestError from '@/errors/RequestError';
import * as functions from '@/middleware/koa-auth';
import { createRequester } from '@/utils/test-utils';

import authnRoutes from './authn';

describe('authn route for Hasura', () => {
  const request = createRequester({ anonymousRoutes: authnRoutes });
  const mockUserId = 'foo';
  const mockExpectedRole = 'some_role';
  const mockUnauthorizedRole = 'V';
  const keys = Object.freeze({
    expectedRole: 'Expected-Role',
    hasuraUserId: 'X-Hasura-User-Id',
    hasuraRole: 'X-Hasura-Role',
  });

  describe('with successful verification', () => {
    beforeEach(() => {
      jest.spyOn(functions, 'verifyBearerTokenFromRequest').mockResolvedValue({
        clientId: 'ok',
        sub: mockUserId,
        roleNames: [mockExpectedRole],
      });
    });

    it('has expected role', async () => {
      const response = await request
        .get('/authn/hasura')
        .query({ resource: 'https://api.logto.io' })
        .set(keys.expectedRole, mockExpectedRole);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        [keys.hasuraUserId]: mockUserId,
        [keys.hasuraRole]: mockExpectedRole,
      });
    });

    it('throws 401 if no expected role present', async () => {
      const response = await request
        .get('/authn/hasura')
        .query({ resource: 'https://api.logto.io' })
        .set(keys.expectedRole, mockExpectedRole + '1');
      expect(response.status).toEqual(401);
    });

    it('falls back to unauthorized role if no expected role present', async () => {
      const response = await request
        .get('/authn/hasura')
        .query({ resource: 'https://api.logto.io', unauthorizedRole: mockUnauthorizedRole })
        .set(keys.expectedRole, mockExpectedRole + '1');
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        [keys.hasuraUserId]: mockUserId,
        [keys.hasuraRole]: mockUnauthorizedRole,
      });
    });
  });

  describe('with failed verification', () => {
    beforeEach(() => {
      jest
        .spyOn(functions, 'verifyBearerTokenFromRequest')
        .mockImplementation(async (_, resource) => {
          if (resource) {
            throw new RequestError({ code: 'auth.jwt_sub_missing', status: 401 });
          }

          return { clientId: 'not ok', sub: mockUserId };
        });
    });

    it('throws 401 if no unauthorized role presents', async () => {
      const response = await request
        .get('/authn/hasura')
        .query({ resource: 'https://api.logto.io' })
        .set(keys.expectedRole, mockExpectedRole);
      expect(response.status).toEqual(401);
    });

    it('falls back to unauthorized role with user id if no expected resource present', async () => {
      const response = await request
        .get('/authn/hasura')
        .query({ resource: 'https://api.logto.io', unauthorizedRole: mockUnauthorizedRole })
        .set(keys.expectedRole, mockExpectedRole);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        [keys.hasuraUserId]: mockUserId,
        [keys.hasuraRole]: mockUnauthorizedRole,
      });
    });

    it('falls back to unauthorized role if JWT is invalid', async () => {
      jest
        .spyOn(functions, 'verifyBearerTokenFromRequest')
        .mockRejectedValue(new RequestError({ code: 'auth.jwt_sub_missing', status: 401 }));
      const response = await request
        .get('/authn/hasura')
        .query({ resource: 'https://api.logto.io', unauthorizedRole: mockUnauthorizedRole });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        [keys.hasuraRole]: mockUnauthorizedRole,
      });
    });
  });
});
