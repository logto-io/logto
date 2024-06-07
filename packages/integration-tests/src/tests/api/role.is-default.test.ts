import {
  InteractionEvent,
  SignInIdentifier,
  type Resource,
  type Role,
  type Scope,
} from '@logto/schemas';
import { noop } from '@silverhand/essentials';

import { createUser, deleteUser, getUserRoles } from '#src/api/admin-user.js';
import { putInteraction, updateSignInExperience } from '#src/api/index.js';
import { createResource, deleteResource } from '#src/api/resource.js';
import { assignScopesToRole, createRole, deleteRole } from '#src/api/role.js';
import { createScope } from '#src/api/scope.js';
import { initClient, processSession } from '#src/helpers/client.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generatePassword, generateUsername } from '#src/utils.js';

class TestContext {
  resource?: Resource;
  scopes: Scope[] = [];
  roles: Role[] = [];
}

describe('default roles', () => {
  const context = new TestContext();

  beforeAll(async () => {
    await enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    });
    await updateSignInExperience({ passwordPolicy: { length: { max: 256 } } });

    // Set up a resource with two scopes and two default roles, each with one of the scopes
    const resource = await createResource();
    const scopes = await Promise.all([createScope(resource.id), createScope(resource.id)]);
    const roles = await Promise.all([
      createRole({ isDefault: true }),
      createRole({ isDefault: true }),
    ]);
    await Promise.all([
      assignScopesToRole([scopes[0].id], roles[0].id),
      assignScopesToRole([scopes[1].id], roles[1].id),
    ]);

    /* eslint-disable @silverhand/fp/no-mutation */
    context.resource = resource;
    context.scopes = scopes;
    context.roles = roles;
    /* eslint-enable @silverhand/fp/no-mutation */
  });

  afterAll(async () => {
    await Promise.all(
      [
        ...context.roles.map(async (role) => deleteRole(role.id)),
        deleteResource(context.resource!.id),
      ].map(async (promise) => promise.catch(noop))
    );
  });

  it('should automatically assign default roles to new users created via Management API', async () => {
    // Create a new user
    const user = await createUser();

    // Check that the user has the default roles
    const userRoles = await getUserRoles(user.id);
    expect(userRoles.map((role) => role.id)).toEqual(
      expect.arrayContaining(context.roles.map((role) => role.id))
    );

    await deleteUser(user.id);
  });

  it('should automatically assign default roles to new users via sign-in experience', async () => {
    const username = generateUsername();
    const password = generatePassword();

    // Process the sign-in flow
    const client = await initClient({
      resources: [context.resource!.indicator],
      scopes: context.scopes.map((scope) => scope.name),
    });
    await client.successSend(putInteraction, {
      event: InteractionEvent.Register,
      profile: { username, password },
    });
    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);

    // Check claims and roles
    const claims = await client.getAccessTokenClaims(context.resource!.indicator);
    expect(claims.scope?.split(' ')).toEqual(
      expect.arrayContaining(context.scopes.map((scope) => scope.name))
    );

    const roles = await getUserRoles(userId);
    expect(roles.map((role) => role.id)).toEqual(
      expect.arrayContaining(context.roles.map((role) => role.id))
    );

    // Clean up
    await deleteUser(userId);
  });
});
