import { generateStandardId } from '@logto/shared';
import { HTTPError } from 'got';

import {
  createOrganizationScope,
  getOrganizationScopes,
  getOrganizationScope,
  updateOrganizationScope,
  deleteOrganizationScope,
} from '#src/api/organization-scope.js';

const randomId = () => generateStandardId(4);

describe('organization scopes', () => {
  it('should get organization scopes successfully', async () => {
    const [name1, name2] = ['test' + randomId(), 'test' + randomId()];
    await createOrganizationScope(name1, 'A test organization scope.');
    await createOrganizationScope(name2);
    const scopes = await getOrganizationScopes();

    expect(scopes).toContainEqual(
      expect.objectContaining({ name: name1, description: 'A test organization scope.' })
    );
    expect(scopes).toContainEqual(expect.objectContaining({ name: name2, description: null }));
  });

  it('should get organization scopes with pagination', async () => {
    // Add 20 scopes to exceed the default page size
    await Promise.all(
      Array.from({ length: 30 }).map(async () => createOrganizationScope('test' + randomId()))
    );

    const scopes = await getOrganizationScopes();
    expect(scopes).toHaveLength(20);

    const scopes2 = await getOrganizationScopes(
      new URLSearchParams({
        page: '2',
        page_size: '10',
      })
    );
    expect(scopes2.length).toBeGreaterThanOrEqual(10);
    expect(scopes2[0]?.id).not.toBeFalsy();
    expect(scopes2[0]?.id).toBe(scopes[10]?.id);
  });

  it('should be able to create and get organization scopes by id', async () => {
    const createdScope = await createOrganizationScope('test' + randomId());
    const scope = await getOrganizationScope(createdScope.id);

    expect(scope).toStrictEqual(createdScope);
  });

  it('should fail when try to get an organization scope that does not exist', async () => {
    const response = await getOrganizationScope('0').catch((error: unknown) => error);

    expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
  });

  it('should be able to update organization scope', async () => {
    const createdScope = await createOrganizationScope('test' + randomId());
    const newName = 'test' + randomId();
    const scope = await updateOrganizationScope(createdScope.id, newName, 'test description.');
    expect(scope).toStrictEqual({
      ...createdScope,
      name: newName,
      description: 'test description.',
    });
  });

  it('should be able to delete organization scope', async () => {
    const createdScope = await createOrganizationScope('test' + randomId());
    await deleteOrganizationScope(createdScope.id);
    const response = await getOrganizationScope(createdScope.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
  });

  it('should fail when try to delete an organization scope that does not exist', async () => {
    const response = await deleteOrganizationScope('0').catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
  });
});
