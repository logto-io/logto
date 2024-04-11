import { defaultManagementApi } from '@logto/schemas';
import { HTTPError } from 'ky';

import {
  createResource,
  getResource,
  getResources,
  updateResource,
  deleteResource,
  setDefaultResource,
} from '#src/api/index.js';
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
});
