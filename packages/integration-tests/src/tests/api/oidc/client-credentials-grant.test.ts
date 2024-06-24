import assert from 'node:assert';

import { buildOrganizationUrn } from '@logto/core-kit';
import { type Application, ApplicationType, RoleType } from '@logto/schemas';
import { appendPath } from '@silverhand/essentials';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { HTTPError } from 'ky';

import { oidcApi } from '#src/api/api.js';
import {
  assignRolesToApplication,
  createApplication,
  deleteApplication,
} from '#src/api/application.js';
import { createResource, setDefaultResource } from '#src/api/resource.js';
import { assignScopesToRole, createRole } from '#src/api/role.js';
import { createScope } from '#src/api/scope.js';
import { isDevFeaturesEnabled, logtoUrl } from '#src/constants.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import { devFeatureTest, randomString } from '#src/utils.js';

type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
};

describe('client credentials grant', () => {
  const jwkSet = createRemoteJWKSet(appendPath(new URL(logtoUrl), 'oidc/jwks'));
  const organizationApi = new OrganizationApiTest();
  // eslint-disable-next-line @silverhand/fp/no-let
  let client: Application;

  const post = async (additionalParams: Record<string, string> = {}) =>
    oidcApi
      .post('token', {
        body: new URLSearchParams({
          client_id: client.id,
          client_secret: client.secret,
          grant_type: 'client_credentials',
          ...additionalParams,
        }),
      })
      .json<TokenResponse>();

  const expectError = async (
    additionalParams: Record<string, string>,
    status: number,
    json?: Record<string, unknown>
  ) => {
    const error = await post(additionalParams).catch((error: unknown) => error);
    assert(error instanceof HTTPError);
    expect(error.response.status).toBe(status);

    if (json) {
      expect(await error.response.json()).toMatchObject(json);
    }
  };

  beforeAll(async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    client = await createApplication('client credentials test', ApplicationType.MachineToMachine);
  });

  afterAll(async () => {
    await Promise.all([deleteApplication(client.id), organizationApi.cleanUp()]);
  });

  describe('general failed cases', () => {
    it('should fail if the client is not found', async () => {
      await expectError({ client_id: 'not-found', client_secret: 'not-found' }, 400, {
        error: 'invalid_client',
        error_description: 'invalid client not-found',
      });
    });
  });

  describe('resource server', () => {
    it('should fail if the resource server is not found', async () => {
      await expectError({ resource: 'https://not-found' }, 400, {
        error: 'invalid_target',
        error_description: 'resource indicator is missing, or unknown',
      });
    });

    it('should be able to get a token for a resource server', async () => {
      const resource = await createResource();
      const { access_token: accessToken, scope } = await post({ resource: resource.indicator });

      expect(scope).toBe(undefined);

      const verified = await jwtVerify(accessToken, jwkSet, { audience: resource.indicator });
      expect(verified.payload.scope).toBe(undefined);
    });

    it('should be able to get a token for a resource server with valid scope', async () => {
      const resource = await createResource();
      const scope = await createScope(resource.id, 'test-scope');
      const role = await createRole({
        name: `cc-${randomString()}`,
        type: RoleType.MachineToMachine,
      });
      await assignScopesToRole([scope.id], role.id);
      await assignRolesToApplication(client.id, [role.id]);

      const { access_token: accessToken, scope: returnedScope } = await post({
        resource: resource.indicator,
        scope: `${scope.name} ${randomString()}`,
      });

      expect(returnedScope).toBe(scope.name);

      const verified = await jwtVerify(accessToken, jwkSet, { audience: resource.indicator });
      expect(verified.payload.scope).toBe(scope.name);
    });

    it('should fall back to the default resource server if no `resource` parameter is provided', async () => {
      const resource = await createResource();
      await setDefaultResource(resource.id);
      const { access_token: accessToken, scope } = await post();

      expect(scope).toBe(undefined);

      const verified = await jwtVerify(accessToken, jwkSet, { audience: resource.indicator });
      expect(verified.payload.scope).toBe(undefined);
    });
  });

  describe('organization token', () => {
    it('should fail if dev feature is not enabled', async () => {
      if (isDevFeaturesEnabled) {
        return;
      }

      await expectError({ organization_id: 'not-found' }, 400, {
        error: 'invalid_target',
        error_description: 'organization tokens are not supported yet',
      });
    });
  });

  devFeatureTest.describe('organization token', () => {
    it('should fail if the application is not associated with the organization', async () => {
      await expectError({ organization_id: 'not-found' }, 403, {
        error: 'access_denied',
        error_description: 'app has not associated with the organization',
      });
    });

    it('should be able to get an organization token', async () => {
      const organization = await organizationApi.create({ name: 'test-organization' });
      await organizationApi.applications.add(organization.id, [client.id]);
      const { access_token: accessToken, scope } = await post({ organization_id: organization.id });

      expect(scope).toBe('');

      const verified = await jwtVerify(accessToken, jwkSet, {
        audience: buildOrganizationUrn(organization.id),
      });
      expect(verified.payload.scope).toBe('');
    });

    it('should be able to get an organization token with valid scope', async () => {
      const organization = await organizationApi.create({ name: 'test-organization' });
      await organizationApi.applications.add(organization.id, [client.id]);
      const scope = await organizationApi.scopeApi.create({ name: `test-scope-${randomString()}` });
      const role = await organizationApi.roleApi.create({
        name: `cc-${randomString()}`,
        type: RoleType.MachineToMachine,
        organizationScopeIds: [scope.id],
      });
      await organizationApi.addApplicationRoles(organization.id, client.id, [role.id]);

      const { access_token: accessToken, scope: returnedScope } = await post({
        organization_id: organization.id,
        scope: `${scope.name} ${randomString()}`,
      });

      expect(returnedScope).toBe(scope.name);

      const verified = await jwtVerify(accessToken, jwkSet, {
        audience: buildOrganizationUrn(organization.id),
      });
      expect(verified.payload.scope).toBe(scope.name);
    });

    it('should be able to get an organization token with valid scope and resource', async () => {
      const organization = await organizationApi.create({ name: 'test-organization' });
      await organizationApi.applications.add(organization.id, [client.id]);

      const resource = await createResource();
      const [scope1, scope2, scope3] = await Promise.all([
        createScope(resource.id, `test-scope-${randomString()}`),
        createScope(resource.id, `test-scope-${randomString()}`),
        createScope(resource.id, `test-scope-${randomString()}`),
      ]);
      const role = await organizationApi.roleApi.create({
        name: `cc-${randomString()}`,
        type: RoleType.MachineToMachine,
        resourceScopeIds: [scope1.id, scope2.id],
      });
      await organizationApi.addApplicationRoles(organization.id, client.id, [role.id]);

      const { access_token: accessToken, scope: returnedScope } = await post({
        organization_id: organization.id,
        resource: resource.indicator,
        scope: `${scope1.name} ${scope2.name} ${scope3.name} ${randomString()}`,
      });
      expect(returnedScope).toBe(`${scope1.name} ${scope2.name}`);

      const verified = await jwtVerify(accessToken, jwkSet, { audience: resource.indicator });
      expect(verified.payload.scope).toBe(`${scope1.name} ${scope2.name}`);
    });

    it('should only issue requested scopes', async () => {
      const organization = await organizationApi.create({ name: 'test-organization' });
      await organizationApi.applications.add(organization.id, [client.id]);

      const resource = await createResource();
      const [scope1, scope2] = await Promise.all([
        createScope(resource.id, `test-scope-${randomString()}`),
        createScope(resource.id, `test-scope-${randomString()}`),
      ]);
      const role = await organizationApi.roleApi.create({
        name: `cc-${randomString()}`,
        type: RoleType.MachineToMachine,
        resourceScopeIds: [scope1.id, scope2.id],
      });
      await organizationApi.addApplicationRoles(organization.id, client.id, [role.id]);

      const { access_token: accessToken1, scope: returnedScope1 } = await post({
        organization_id: organization.id,
        resource: resource.indicator,
        scope: `${scope1.name}`,
      });
      expect(returnedScope1).toBe(scope1.name);

      const verified1 = await jwtVerify(accessToken1, jwkSet, { audience: resource.indicator });
      expect(verified1.payload.scope).toBe(scope1.name);

      const { access_token: accessToken2, scope: returnedScope2 } = await post({
        organization_id: organization.id,
        resource: resource.indicator,
        scope: '',
      });
      expect(returnedScope2).toBe(undefined);

      const verified2 = await jwtVerify(accessToken2, jwkSet, { audience: resource.indicator });
      expect(verified2.payload.scope).toBe(undefined);
    });
  });
});
