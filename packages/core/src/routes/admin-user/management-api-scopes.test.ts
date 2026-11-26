import {
  ManagementApiScope,
  MfaFactor,
  PredefinedScope,
  type User,
  UsersPasswordEncryptionMethod,
} from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';
import Koa from 'koa';
import Router from 'koa-router';
import request from 'supertest';

import { mockUser } from '#src/__mocks__/index.js';
import koaErrorHandler from '#src/middleware/koa-error-handler.js';
import koaI18next from '#src/middleware/koa-i18next.js';
import {
  maskedCredentialValue,
  registerManagementApiPolicyEnforcer,
} from '#src/middleware/koa-management-api-permission.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import type { ManagementApiRouter } from '../types.js';

const { jest } = import.meta;

const mockUserWithSecrets: User = {
  ...mockUser,
  passwordEncrypted: 'hashed-password',
  passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
  mfaVerifications: [
    {
      id: 'webauthn-id',
      type: MfaFactor.WebAuthn,
      createdAt: new Date().toISOString(),
      credentialId: 'cred-id',
      publicKey: 'public-key-secret',
      counter: 0,
      agent: 'Chrome',
      transports: [],
    },
  ],
};

const mockPat = {
  tenantId: 'default',
  userId: mockUser.id,
  name: 'my-token',
  value: 'pat_super_secret_value',
  createdAt: Date.now(),
  expiresAt: null,
};

const adminUserRoutes = await pickDefault(import('./index.js'));

const buildUsersApp = (scopes: string[], options?: { isReadOnly?: boolean }) => {
  const findUserById = jest.fn(async () => mockUserWithSecrets);
  const findUsers = jest.fn(async () => [mockUserWithSecrets]);
  const countUsers = jest.fn(async () => ({ count: 1 }));
  const getTokensByUserId = jest.fn(async () => [mockPat]);

  const tenant = new MockTenant(undefined, {
    users: {
      findUserById,
      findUsers,
      countUsers,
    },
    personalAccessTokens: {
      getTokensByUserId,
    },
  });

  const router: ManagementApiRouter = new Router();
  router.use(async (ctx, next) => {
    ctx.auth = {
      type: 'app',
      id: 'm2m-app',
      scopes: new Set(scopes),
      isReadOnly: options?.isReadOnly,
    };
    return next();
  });

  const finalize = registerManagementApiPolicyEnforcer(router);
  adminUserRoutes(router, tenant);
  finalize();

  const app = new Koa();
  app.use(koaI18next());
  app.use(koaErrorHandler());
  app.use(router.routes()).use(router.allowedMethods());

  return { app, findUserById, getTokensByUserId };
};

describe('Users Management API scopes and credential masking', () => {
  it('suppresses includePasswordHash for read:users tokens on GET /users and GET /users/:userId', async () => {
    const { app: scopedApp } = buildUsersApp([ManagementApiScope.ReadUsers]);

    const listResponse = await request(scopedApp.callback()).get('/users?includePasswordHash=true');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body[0]).not.toHaveProperty('passwordDigest');

    const getResponse = await request(scopedApp.callback()).get(
      `/users/${mockUser.id}?includePasswordHash=true`
    );
    expect(getResponse.status).toBe(200);
    expect(getResponse.body).not.toHaveProperty('passwordDigest');

    const { app: allApp } = buildUsersApp([PredefinedScope.All]);
    const allResponse = await request(allApp.callback()).get(
      `/users/${mockUser.id}?includePasswordHash=true`
    );
    expect(allResponse.status).toBe(200);
    expect(allResponse.body).toHaveProperty('passwordDigest', 'hashed-password');
  });

  it('suppresses includeWebAuthnCredentials for read:users tokens on GET /users/:userId/mfa-verifications', async () => {
    const { app: scopedApp } = buildUsersApp([ManagementApiScope.ReadUsers]);
    const scopedResponse = await request(scopedApp.callback()).get(
      `/users/${mockUser.id}/mfa-verifications?includeWebAuthnCredentials=true`
    );
    expect(scopedResponse.status).toBe(200);
    expect(scopedResponse.body[0]).not.toHaveProperty('publicKey');

    const { app: allApp } = buildUsersApp([PredefinedScope.All]);
    const allResponse = await request(allApp.callback()).get(
      `/users/${mockUser.id}/mfa-verifications?includeWebAuthnCredentials=true`
    );
    expect(allResponse.status).toBe(200);
    expect(allResponse.body[0]).toHaveProperty('publicKey', 'public-key-secret');
  });

  it('masks PAT value for read:users tokens while keeping metadata and leaving `all` unmasked', async () => {
    const { app: scopedApp } = buildUsersApp([ManagementApiScope.ReadUsers]);
    const scopedResponse = await request(scopedApp.callback()).get(
      `/users/${mockUser.id}/personal-access-tokens`
    );
    expect(scopedResponse.status).toBe(200);
    expect(scopedResponse.body).toEqual([
      expect.objectContaining({
        name: mockPat.name,
        value: maskedCredentialValue,
      }),
    ]);

    const { app: allApp } = buildUsersApp([PredefinedScope.All]);
    const allResponse = await request(allApp.callback()).get(
      `/users/${mockUser.id}/personal-access-tokens`
    );
    expect(allResponse.status).toBe(200);
    expect(allResponse.body).toEqual([
      expect.objectContaining({
        name: mockPat.name,
        value: mockPat.value,
      }),
    ]);
  });

  it('rejects read:users tokens with 403 on write and all-only user routes', async () => {
    const { app } = buildUsersApp([ManagementApiScope.ReadUsers]);

    const createResponse = await request(app.callback()).post('/users').send({ name: 'Alice' });
    expect(createResponse.status).toBe(403);

    const roleAssignResponse = await request(app.callback())
      .post(`/users/${mockUser.id}/roles`)
      .send({ roleIds: ['role-1'] });
    expect(roleAssignResponse.status).toBe(403);

    const patCreateResponse = await request(app.callback())
      .post(`/users/${mockUser.id}/personal-access-tokens`)
      .send({ name: 'new-pat' });
    expect(patCreateResponse.status).toBe(403);
  });
});
