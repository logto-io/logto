import assert from 'node:assert';

import { generateStandardId } from '@logto/shared';
import { isKeyInObject } from '@silverhand/essentials';
import { HTTPError } from 'ky';

import { OrganizationScopeApiTest } from '#src/helpers/organization.js';

const randomId = () => generateStandardId(4);

describe('organization scope APIs', () => {
  const scopeApi = new OrganizationScopeApiTest();

  afterEach(async () => {
    await scopeApi.cleanUp();
  });

  it('should fail if the name of the new organization scope already exists', async () => {
    const name = 'test' + randomId();
    await scopeApi.create({ name });
    const response = await scopeApi.create({ name }).catch((error: unknown) => error);

    assert(response instanceof HTTPError);

    const body: unknown = await response.response.json();
    expect(response.response.status).toBe(422);
    expect(isKeyInObject(body, 'code') && body.code).toBe('entity.unique_integrity_violation');
  });

  it('should get organization scopes successfully', async () => {
    const [name1, name2] = ['test' + randomId(), 'test' + randomId()];
    await scopeApi.create({ name: name1, description: 'A test organization scope.' });
    await scopeApi.create({ name: name2 });
    const scopes = await scopeApi.getList();

    expect(scopes).toContainEqual(
      expect.objectContaining({ name: name1, description: 'A test organization scope.' })
    );
    expect(scopes).toContainEqual(expect.objectContaining({ name: name2, description: null }));
  });

  it('should get organization scopes with pagination', async () => {
    // Add 20 scopes to exceed the default page size
    await Promise.all(
      Array.from({ length: 30 }).map(async () => scopeApi.create({ name: 'test' + randomId() }))
    );

    const scopes = await scopeApi.getList();
    expect(scopes).toHaveLength(20);

    const scopes2 = await scopeApi.getList(
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
    const createdScope = await scopeApi.create({ name: 'test' + randomId() });
    const scope = await scopeApi.get(createdScope.id);

    expect(scope).toStrictEqual(createdScope);
  });

  it('should fail when try to get an organization scope that does not exist', async () => {
    const response = await scopeApi.get('0').catch((error: unknown) => error);

    expect(response instanceof HTTPError && response.response.status).toBe(404);
  });

  it('should be able to update organization scope', async () => {
    const createdScope = await scopeApi.create({ name: 'test' + randomId() });
    const newName = 'test' + randomId();
    const scope = await scopeApi.update(createdScope.id, {
      name: newName,
      description: 'test description.',
    });
    expect(scope).toStrictEqual({
      ...createdScope,
      name: newName,
      description: 'test description.',
    });
  });

  it('should fail when try to update an organization scope with a name that already exists', async () => {
    const [scope1, scope2] = await Promise.all([
      scopeApi.create({ name: 'test' + randomId() }),
      scopeApi.create({ name: 'test' + randomId() }),
    ]);
    const response = await scopeApi
      .update(scope2.id, {
        name: scope1.name,
      })
      .catch((error: unknown) => error);

    assert(response instanceof HTTPError);
    expect(response.response.status).toBe(422);
    expect(await response.response.json()).toMatchObject(
      expect.objectContaining({
        code: 'entity.unique_integrity_violation',
      })
    );
  });

  it('should be able to delete organization scope', async () => {
    const createdScope = await scopeApi.create({ name: 'test' + randomId() });
    await scopeApi.delete(createdScope.id);
    const response = await scopeApi.get(createdScope.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.status).toBe(404);
  });

  it('should fail when try to delete an organization scope that does not exist', async () => {
    const response = await scopeApi.delete('0').catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.status).toBe(404);
  });
});
