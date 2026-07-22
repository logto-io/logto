import { ApplicationType, RoleType } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { HTTPError } from 'ky';

import {
  clientCredentialsJwtCustomizerPayload,
  clientCredentialsSampleScript,
} from '#src/__mocks__/jwt-customizer.js';
import { oidcApi } from '#src/api/api.js';
import {
  createApplication,
  createApplicationWithSecret,
  getApplicationRoles,
  assignRolesToApplication,
  deleteRoleFromApplication,
  putRolesToApplication,
  getApplications,
  createResource,
  upsertJwtCustomizer,
  deleteJwtCustomizer,
} from '#src/api/index.js';
import { createRole, assignApplicationsToRole } from '#src/api/role.js';
import { createScope } from '#src/api/scope.js';
import { expectRejects } from '#src/helpers/index.js';
import { getAccessTokenPayload } from '#src/utils.js';

describe('admin console application management (roles)', () => {
  it('should get empty list successfully', async () => {
    const applicationType = ApplicationType.MachineToMachine;
    const application = await createApplication(generateStandardId(), applicationType);

    const applicationRoles = await getApplicationRoles(application.id);
    expect(applicationRoles.length).toBe(0);
  });

  it('throws when trying to get roles of non-m2m app', async () => {
    const applicationType = ApplicationType.SPA;
    const application = await createApplication(generateStandardId(), applicationType);

    const response = await getApplicationRoles(application.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.status === 422).toBe(true);
  });

  it('should assign roles to app and get list successfully', async () => {
    const applicationType = ApplicationType.MachineToMachine;
    const application = await createApplication(generateStandardId(), applicationType);
    const role1 = await createRole({ type: RoleType.MachineToMachine });
    const role2 = await createRole({ type: RoleType.MachineToMachine });

    await assignRolesToApplication(application.id, [role1.id, role2.id]);
    const roles = await getApplicationRoles(application.id);
    expect(roles.length).toBe(2);
    expect(roles.find(({ id }) => id === role1.id)).toBeDefined();
    expect(roles.find(({ id }) => id === role2.id)).toBeDefined();

    // Empty keyword should be ignored, all assigned roles should be returned
    await expect(getApplicationRoles(application.id, '')).resolves.toHaveLength(2);

    // Get right assigned roles with search keyword
    const rolesWithSearchParams = await getApplicationRoles(application.id, role1.name);
    expect(rolesWithSearchParams).toHaveLength(1);
    expect(rolesWithSearchParams.find(({ id }) => id === role2.id)).toBeUndefined();
  });

  it('should silently ignore already-assigned roles on re-assign', async () => {
    const applicationType = ApplicationType.MachineToMachine;
    const application = await createApplication(generateStandardId(), applicationType);
    const role = await createRole({ type: RoleType.MachineToMachine });

    const firstResponse = await assignRolesToApplication(application.id, [role.id]);
    expect(firstResponse).toEqual({ roleIds: [role.id], addedRoleIds: [role.id] });

    const secondResponse = await assignRolesToApplication(application.id, [role.id]);
    expect(secondResponse).toEqual({ roleIds: [role.id], addedRoleIds: [] });

    const roles = await getApplicationRoles(application.id);
    expect(roles).toHaveLength(1);
  });

  it('should fail when assign role to non-m2m app', async () => {
    const applicationType = ApplicationType.SPA;
    const application = await createApplication(generateStandardId(), applicationType);
    const role = await createRole({ type: RoleType.MachineToMachine });

    await expectRejects(assignRolesToApplication(application.id, [role.id]), {
      code: 'application.invalid_type',
      status: 422,
    });
  });

  it('should put roles to app successfully', async () => {
    const applicationType = ApplicationType.MachineToMachine;
    const application = await createApplication(generateStandardId(), applicationType);
    const role1 = await createRole({ type: RoleType.MachineToMachine });
    const role2 = await createRole({ type: RoleType.MachineToMachine });
    const role3 = await createRole({ type: RoleType.MachineToMachine });

    await assignRolesToApplication(application.id, [role2.id]);
    const roles = await getApplicationRoles(application.id);
    expect(roles.length).toBe(1);
    expect(roles.find(({ id }) => id === role2.id)).toBeDefined();

    await putRolesToApplication(application.id, [role1.id, role3.id]);
    const updatedRoles = await getApplicationRoles(application.id);
    expect(updatedRoles.length).toBe(2);
    expect(updatedRoles.find(({ id }) => id === role1.id)).toBeDefined();
    expect(updatedRoles.find(({ id }) => id === role3.id)).toBeDefined();
  });

  it('should delete role from app successfully', async () => {
    const applicationType = ApplicationType.MachineToMachine;
    const application = await createApplication(generateStandardId(), applicationType);
    const role1 = await createRole({ type: RoleType.MachineToMachine });
    const role2 = await createRole({ type: RoleType.MachineToMachine });

    await assignRolesToApplication(application.id, [role1.id, role2.id]);
    await deleteRoleFromApplication(application.id, role1.id);

    const roles = await getApplicationRoles(application.id);
    expect(roles.length).toBe(1);
  });

  it('should failed to delete non-existing-role from app', async () => {
    const applicationType = ApplicationType.MachineToMachine;
    const application = await createApplication(generateStandardId(), applicationType);
    const role = await createRole({ type: RoleType.MachineToMachine });

    const response = await deleteRoleFromApplication(application.id, role.id).catch(
      (error: unknown) => error
    );
    expect(response instanceof HTTPError && response.response.status === 404).toBe(true);
  });

  // This case tests GET operation on applications and filter by `types` parameter and `search` parameter.
  it('search applications with specified keyword, types and other parameters', async () => {
    const applicationNamePrefix = `test-app-${generateStandardId(4)}`;
    const m2mAppName002 = `${applicationNamePrefix}-002-m2m`;
    const spaAppName002 = `${applicationNamePrefix}-002-spa`;

    await createApplication(`${applicationNamePrefix}-001-m2m`, ApplicationType.MachineToMachine);
    const m2mApp002 = await createApplication(m2mAppName002, ApplicationType.MachineToMachine);
    await createApplication(`${applicationNamePrefix}-001-spa`, ApplicationType.SPA);
    await createApplication(spaAppName002, ApplicationType.SPA);
    await createApplication(`${applicationNamePrefix}-001-native`, ApplicationType.Native);
    await createApplication(`${applicationNamePrefix}-002-native`, ApplicationType.Native);

    // Search applications with `types` and `search` parameters
    const spaAndM2mAppsWithKeyword = await getApplications(
      [ApplicationType.SPA, ApplicationType.MachineToMachine],
      { search: `%${applicationNamePrefix}-002%` }
    );
    expect(spaAndM2mAppsWithKeyword.length).toBe(2);
    expect(spaAndM2mAppsWithKeyword.find(({ name }) => name === m2mAppName002)).toBeTruthy();
    expect(spaAndM2mAppsWithKeyword.find(({ name }) => name === spaAppName002)).toBeTruthy();

    // Search applications with `types`, `search` and `excludeRoleId` parameters
    const m2mRole = await createRole({ type: RoleType.MachineToMachine });
    await assignApplicationsToRole([m2mApp002.id], m2mRole.id);
    const applications = await getApplications(
      [ApplicationType.SPA, ApplicationType.MachineToMachine],
      { search: `%${applicationNamePrefix}-002%`, excludeRoleId: m2mRole.id }
    );
    expect(applications.length).toBe(1);
    expect(applications.find(({ name }) => name === m2mAppName002)).toBeFalsy();
    expect(applications.find(({ name }) => name === spaAppName002)).toBeTruthy();
  });

  it('test m2m application client credentials grant type with custom JWT', async () => {
    await upsertJwtCustomizer('client-credentials', {
      ...clientCredentialsJwtCustomizerPayload,
      script: clientCredentialsSampleScript,
    });

    const m2mApp = await createApplicationWithSecret(
      generateStandardId(),
      ApplicationType.MachineToMachine
    );
    const resource = await createResource();
    const createdScope = await createScope(resource.id);
    const createdScope2 = await createScope(resource.id);
    const role = await createRole({
      type: RoleType.MachineToMachine,
      scopeIds: [createdScope.id, createdScope2.id],
    });
    await assignApplicationsToRole([m2mApp.id], role.id);

    const { access_token: accessToken } = await oidcApi
      .post('token', {
        body: new URLSearchParams({
          client_id: m2mApp.id,
          client_secret: m2mApp.secret,
          grant_type: 'client_credentials',
          resource: resource.indicator,
          scope: [createdScope.name, createdScope2.name].join(' '),
        }),
      })
      .json<{ access_token: string }>();

    const payload = getAccessTokenPayload(accessToken);
    expect(payload).toHaveProperty('foo', 'bar');
    expect(payload).toHaveProperty('API_KEY', '12345');

    await deleteJwtCustomizer('client-credentials');
  });
});
