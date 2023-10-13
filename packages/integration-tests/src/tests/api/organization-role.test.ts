import assert from 'node:assert';

import { generateStandardId } from '@logto/shared';
import { isKeyInObject } from '@silverhand/essentials';
import { HTTPError } from 'got';

import { roleApi } from '#src/api/organization-role.js';
import { scopeApi } from '#src/api/organization-scope.js';

const randomId = () => generateStandardId(4);

describe('organization roles', () => {
  it('should fail if the name of the new organization role already exists', async () => {
    const name = 'test' + randomId();
    await roleApi.create({ name });
    const response = await roleApi.create({ name }).catch((error: unknown) => error);

    assert(response instanceof HTTPError);

    const { statusCode, body: raw } = response.response;
    const body: unknown = JSON.parse(String(raw));
    expect(statusCode).toBe(400);
    expect(isKeyInObject(body, 'code') && body.code).toBe('entity.duplicate_value_of_unique_field');
  });

  it('should be able to create a role with some scopes', async () => {
    const name = 'test' + randomId();
    const [scope1, scope2] = await Promise.all([
      scopeApi.create({ name: 'test' + randomId() }),
      scopeApi.create({ name: 'test' + randomId() }),
    ]);
    const scopeIds = [scope1.id, scope2.id];
    const role = await roleApi.create({ name, scopeIds });

    expect(role).toStrictEqual(
      expect.objectContaining({
        name,
      })
    );

    // TODO: Check scopes under a role after API is implemented
    await Promise.all([scopeApi.delete(scope1.id), scopeApi.delete(scope2.id)]);
  });

  it('should get organization roles successfully', async () => {
    const [name1, name2] = ['test' + randomId(), 'test' + randomId()];
    await roleApi.create({ name: name1, description: 'A test organization role.' });
    await roleApi.create({ name: name2 });
    const roles = await roleApi.getList();

    expect(roles).toContainEqual(
      expect.objectContaining({ name: name1, description: 'A test organization role.' })
    );
    expect(roles).toContainEqual(expect.objectContaining({ name: name2, description: null }));
  });

  it('should get organization roles with pagination', async () => {
    // Add 20 roles to exceed the default page size
    await Promise.all(
      Array.from({ length: 30 }).map(async () => roleApi.create({ name: 'test' + randomId() }))
    );

    const roles = await roleApi.getList();
    expect(roles).toHaveLength(20);

    const roles2 = await roleApi.getList(
      new URLSearchParams({
        page: '2',
        page_size: '10',
      })
    );
    expect(roles2.length).toBeGreaterThanOrEqual(10);
    expect(roles2[0]?.id).not.toBeFalsy();
    expect(roles2[0]?.id).toBe(roles[10]?.id);
  });

  it('should be able to create and get organization roles by id', async () => {
    const createdRole = await roleApi.create({ name: 'test' + randomId() });
    const role = await roleApi.get(createdRole.id);

    expect(role).toStrictEqual(createdRole);
  });

  it('should fail when try to get an organization role that does not exist', async () => {
    const response = await roleApi.get('0').catch((error: unknown) => error);

    expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
  });

  it('should be able to update organization role', async () => {
    const createdRole = await roleApi.create({ name: 'test' + randomId() });
    const newName = 'test' + randomId();
    const role = await roleApi.update(createdRole.id, {
      name: newName,
      description: 'test description.',
    });
    expect(role).toStrictEqual({
      ...createdRole,
      name: newName,
      description: 'test description.',
    });
  });

  it('should be able to delete organization role', async () => {
    const createdRole = await roleApi.create({ name: 'test' + randomId() });
    await roleApi.delete(createdRole.id);
    const response = await roleApi.get(createdRole.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
  });

  it('should fail when try to delete an organization role that does not exist', async () => {
    const response = await roleApi.delete('0').catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.statusCode).toBe(404);
  });
});
