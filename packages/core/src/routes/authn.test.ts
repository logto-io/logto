import { pickDefault, createMockUtils } from '@logto/shared/esm';

import RequestError from '#src/errors/RequestError/index.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const { verifyBearerTokenFromRequest } = await mockEsmWithActual(
  '#src/middleware/koa-auth.js',
  () => ({
    verifyBearerTokenFromRequest: jest.fn(),
  })
);

const { createRequester } = await import('#src/utils/test-utils.js');
const request = createRequester({
  anonymousRoutes: await pickDefault(import('#src/routes/authn.js')),
});

describe('authn route for Hasura', () => {
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
      verifyBearerTokenFromRequest.mockResolvedValue({
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
      verifyBearerTokenFromRequest.mockImplementation(async (_, __, resource) => {
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
      verifyBearerTokenFromRequest.mockRejectedValue(
        new RequestError({ code: 'auth.jwt_sub_missing', status: 401 })
      );

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
