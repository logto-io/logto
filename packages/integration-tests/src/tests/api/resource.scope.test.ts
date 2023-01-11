import { managementResource, managementResourceScope } from '@logto/schemas';
import { HTTPError } from 'got';

import { createResource } from '#src/api/index.js';
import { createScope, deleteScope, getScopes, updateScope } from '#src/api/scope.js';
import { generateScopeName } from '#src/utils.js';

describe('admin console api resources', () => {
  it('should get management api resource scopes successfully', async () => {
    const scopes = await getScopes(managementResource.id);

    expect(scopes[0]).toMatchObject(managementResourceScope);
  });

  it('should create scope successfully', async () => {
    const resource = await createResource();
    const scopeName = generateScopeName();
    const createdScope = await createScope(resource.id, scopeName);

    expect(createdScope.name).toBe(scopeName);

    const scopes = await getScopes(resource.id);

    expect(scopes.some(({ name }) => name === scopeName)).toBeTruthy();
  });

  it('should fail when create scope with name conflict', async () => {
    const resource = await createResource();
    const createdScope = await createScope(resource.id);
    const response = await createScope(resource.id, createdScope.name).catch(
      (error: unknown) => error
    );
    expect(response instanceof HTTPError && response.response.statusCode === 422).toBe(true);
  });

  it('should update scope successfully', async () => {
    const resource = await createResource();
    const scope = await createScope(resource.id);

    expect(scope).toBeTruthy();

    const newScopeName = `new_${scope.name}`;
    const newScopeDescription = `new_${scope.description ?? ''}`;

    const updatesScope = await updateScope(resource.id, scope.id, {
      name: newScopeName,
      description: newScopeDescription,
    });

    expect(updatesScope.id).toBe(scope.id);
    expect(updatesScope.name).toBe(newScopeName);
    expect(updatesScope.description).toBe(newScopeDescription);
  });

  it('should fail when update scope with name conflict', async () => {
    const resource = await createResource();
    const createdScope = await createScope(resource.id);
    const createdScope2 = await createScope(resource.id);
    const response = await updateScope(resource.id, createdScope2.id, {
      name: createdScope.name,
    }).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.statusCode === 422).toBe(true);
  });

  it('should delete scope successfully', async () => {
    const resource = await createResource();
    const scope = await createScope(resource.id);

    expect(scope).toBeTruthy();

    await deleteScope(resource.id, scope.id);

    const scopes = await getScopes(resource.id);

    expect(scopes.some(({ name }) => name === scope.name)).toBeFalsy();
  });
});
