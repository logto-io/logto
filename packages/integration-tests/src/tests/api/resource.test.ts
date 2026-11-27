import { defaultManagementApi, type ResourceResponse } from '@logto/schemas';
import { HTTPError } from 'ky';

import { authedAdminApi } from '#src/api/api.js';
import {
  createResource,
  getResource,
  getResources,
  updateResource,
  deleteResource,
  setDefaultResource,
} from '#src/api/index.js';
import { createRole, deleteRole } from '#src/api/role.js';
import { createScope } from '#src/api/scope.js';
import { expectRejects } from '#src/helpers/index.js';
import { generateResourceIndicator, generateResourceName } from '#src/utils.js';

describe('admin console api resources', () => {
  it('should get management api resource details successfully', async () => {
    const fetchedManagementApiResource = await getResource(defaultManagementApi.resource.id);

    expect(fetchedManagementApiResource).toMatchObject(defaultManagementApi.resource);
  });

  it('should return 404 if resource not found', async () => {
    const response = await getResource('not_found').catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.status === 404).toBe(true);
  });

  it('should create api resource successfully', async () => {
    const resourceName = generateResourceName();
    const resourceIndicator = generateResourceIndicator();

    const createdResource = await createResource(resourceName, resourceIndicator);

    expect(createdResource.name).toBe(resourceName);
    expect(createdResource.indicator).toBe(resourceIndicator);

    const fetchedCreatedResource = await getResource(createdResource.id);

    expect(fetchedCreatedResource).toBeTruthy();
  });

  it('should throw error when create api resource with duplicated resource indicator', async () => {
    const resourceName = generateResourceName();
    const resourceIndicator = generateResourceIndicator();

    // Create first resource
    await createResource(resourceName, resourceIndicator);

    // Create second resource with same indicator should throw
    const resourceName2 = generateResourceName();
    await expectRejects(createResource(resourceName2, resourceIndicator), {
      code: 'resource.resource_identifier_in_use',
      status: 422,
    });
  });

  it('should get resource list successfully', async () => {
    const resourceName = generateResourceName();
    const resourceIndicator = generateResourceIndicator();

    // Create first resource
    await createResource(resourceName, resourceIndicator);

    // Get all resources
    const resources = await getResources();

    expect(resources.length).toBeGreaterThan(0);
    expect(resources.findIndex(({ name }) => name === resourceName)).not.toBe(-1);
  });

  it('should exclude management api resources when requested', async () => {
    const resource = await createResource();

    const [allResourceIds, filteredResourceIds] = await Promise.all([
      getResources().then((resources) => resources.map(({ id }) => id)),
      getResources({ excludeManagementApis: 'true' }).then((resources) =>
        resources.map(({ id }) => id)
      ),
    ]);

    expect(allResourceIds).toContain(defaultManagementApi.resource.id);
    expect(filteredResourceIds).not.toContain(defaultManagementApi.resource.id);
    expect(filteredResourceIds).toContain(resource.id);

    await deleteResource(resource.id);
  });

  it('should update api resource details successfully', async () => {
    const resource = await createResource();

    expect(resource).toBeTruthy();

    const newResourceName = `new_${resource.name}`;
    const newAccessTokenTtl = resource.accessTokenTtl + 100;

    const updatedResource = await updateResource(resource.id, {
      name: newResourceName,
      accessTokenTtl: newAccessTokenTtl,
    });

    expect(updatedResource.id).toBe(resource.id);
    expect(updatedResource.name).toBe(newResourceName);
    expect(updatedResource.accessTokenTtl).toBe(newAccessTokenTtl);
  });

  it('should throw error when update api resource with invalid payload', async () => {
    const resource = await createResource();

    const response = await updateResource(resource.id, {
      // @ts-expect-error for testing
      name: 123,
    }).catch((error: unknown) => error);

    expect(response instanceof HTTPError && response.response.status === 400).toBe(true);
  });

  it('should throw when updating management api resource', async () => {
    await expectRejects(
      updateResource(defaultManagementApi.resource.id, {
        name: 'new-name',
      }),
      {
        code: 'resource.cannot_modify_management_api',
        status: 400,
      }
    );
  });

  it('should not update api resource indicator', async () => {
    const resource = await createResource();
    const newResourceName = `new_${resource.name}`;
    const newResourceIndicator = generateResourceIndicator();

    const updatedResource = await updateResource(resource.id, {
      name: newResourceName,
      indicator: newResourceIndicator,
    });

    expect(updatedResource.id).toBe(resource.id);
    expect(updatedResource.name).toBe(newResourceName);
    expect(updatedResource.indicator).toBe(resource.indicator);
  });

  it('should delete api resource successfully', async () => {
    const createdResource = await createResource();

    expect(createdResource).toBeTruthy();

    await deleteResource(createdResource.id);

    const response = await getResource(createdResource.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.status === 404).toBe(true);
  });

  it('should throw when deleting management api resource', async () => {
    const response = await deleteResource(defaultManagementApi.resource.id).catch(
      (error: unknown) => error
    );
    expect(response instanceof HTTPError && response.response.status === 400).toBe(true);
  });

  it('should throw 404 when delete api resource not found', async () => {
    const response = await deleteResource('dummy_id').catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.status === 404).toBe(true);
  });

  it('be able to set only one default api resource', async () => {
    const [resource1, resource2] = await Promise.all([
      createResource(generateResourceName(), generateResourceIndicator()),
      createResource(generateResourceName(), generateResourceIndicator()),
    ]);

    await setDefaultResource(resource1.id);
    await setDefaultResource(resource2.id);

    const resources = await getResources();
    const defaultData = resources.filter(({ isDefault }) => isDefault);

    expect(defaultData).toHaveLength(1);
    expect(defaultData[0]?.id).toBe(resource2.id);

    await Promise.all([deleteResource(resource1.id), deleteResource(resource2.id)]);
  });

  it('should attach each scope to its own resource when including scopes', async () => {
    const [resource1, resource2] = await Promise.all([createResource(), createResource()]);
    const [scope1, scope2, scope3] = await Promise.all([
      createScope(resource1.id),
      createScope(resource1.id),
      createScope(resource2.id),
    ]);

    const resources = await authedAdminApi
      .get('resources', { searchParams: { includeScopes: 'true' } })
      .json<ResourceResponse[]>();
    const getScopeIds = (resourceId: string) =>
      new Set(resources.find(({ id }) => id === resourceId)?.scopes.map(({ id }) => id));

    expect(getScopeIds(resource1.id)).toEqual(new Set([scope1.id, scope2.id]));
    expect(getScopeIds(resource2.id)).toEqual(new Set([scope3.id]));

    await Promise.all([deleteResource(resource1.id), deleteResource(resource2.id)]);
  });

  it('should filter resources by hasScopes and excludeRoleId', async () => {
    const [emptyResource, fullyAssignedResource, partiallyAssignedResource] = await Promise.all([
      createResource(),
      createResource(),
      createResource(),
    ]);
    const [fullyAssignedScope, assignedScope, unassignedScope] = await Promise.all([
      createScope(fullyAssignedResource.id),
      createScope(partiallyAssignedResource.id),
      createScope(partiallyAssignedResource.id),
    ]);
    const role = await createRole({
      scopeIds: [fullyAssignedScope.id, assignedScope.id],
    });

    const resourcesWithScopes = await getResources({ hasScopes: 'true' });
    const resourcesWithScopesIds = new Set(resourcesWithScopes.map(({ id }) => id));
    expect(resourcesWithScopesIds.has(emptyResource.id)).toBe(false);
    expect(resourcesWithScopesIds.has(fullyAssignedResource.id)).toBe(true);
    expect(resourcesWithScopesIds.has(partiallyAssignedResource.id)).toBe(true);

    const assignableResources = await authedAdminApi
      .get('resources', {
        searchParams: {
          hasScopes: 'true',
          excludeRoleId: role.id,
          includeScopes: 'true',
        },
      })
      .json<ResourceResponse[]>();
    const assignableIds = new Set(assignableResources.map(({ id }) => id));
    expect(assignableIds.has(emptyResource.id)).toBe(false);
    expect(assignableIds.has(fullyAssignedResource.id)).toBe(false);
    expect(assignableIds.has(partiallyAssignedResource.id)).toBe(true);

    const matchedResource = assignableResources.find(
      ({ id }) => id === partiallyAssignedResource.id
    );
    expect(matchedResource?.scopes.map(({ id }) => id)).toEqual([unassignedScope.id]);

    await deleteRole(role.id);
    await Promise.all([
      deleteResource(emptyResource.id),
      deleteResource(fullyAssignedResource.id),
      deleteResource(partiallyAssignedResource.id),
    ]);
  });

  it('should search resources by name, indicator, and scope name with pagination', async () => {
    const token = generateResourceName();
    const [nameResource, indicatorResource, scopeResource] = await Promise.all([
      createResource(`prefix_${token}_name`),
      createResource(generateResourceName(), `https://${token}.example.com/api`),
      createResource(),
    ]);
    const matchingScope = await createScope(scopeResource.id, `read:${token}`);
    const role = await createRole({ scopeIds: [matchingScope.id] });

    const response = await authedAdminApi.get('resources', {
      searchParams: {
        page: '1',
        page_size: '2',
        search: `%${token}%`,
      },
    });
    const paginatedResources = await response.json<ResourceResponse[]>();
    expect(response.headers.get('total-number')).toBe('3');
    expect(paginatedResources).toHaveLength(2);

    const allMatched = await getResources({ search: `%${token}%` });
    expect(new Set(allMatched.map(({ id }) => id))).toEqual(
      new Set([nameResource.id, indicatorResource.id, scopeResource.id])
    );

    const matchedExcludingRole = await getResources({
      search: `%${token}%`,
      excludeRoleId: role.id,
    });
    expect(new Set(matchedExcludingRole.map(({ id }) => id))).toEqual(
      new Set([nameResource.id, indicatorResource.id])
    );

    await deleteRole(role.id);
    await Promise.all([
      deleteResource(nameResource.id),
      deleteResource(indicatorResource.id),
      deleteResource(scopeResource.id),
    ]);
  });
});
