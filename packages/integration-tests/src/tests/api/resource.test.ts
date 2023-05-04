import { defaultManagementApi } from '@logto/schemas';
import { HTTPError } from 'got';

import { createResource, getResource, updateResource, deleteResource } from '#src/api/index.js';
import { createResponseWithCode } from '#src/helpers/admin-tenant.js';
import { generateResourceIndicator, generateResourceName } from '#src/utils.js';

describe('admin console api resources', () => {
  it('should get management api resource details successfully', async () => {
    const fetchedManagementApiResource = await getResource(defaultManagementApi.resource.id);

    expect(fetchedManagementApiResource).toMatchObject(defaultManagementApi.resource);
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
    await expect(createResource(resourceName2, resourceIndicator)).rejects.toMatchObject(
      createResponseWithCode(422)
    );
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
    expect(response instanceof HTTPError && response.response.statusCode === 404).toBe(true);
  });
});
