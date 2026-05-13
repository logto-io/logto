import { type Application, type ApplicationSecret, ApplicationType } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { mockApplication, mockProtectedApplication } from '#src/__mocks__/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockApplicationSecret: ApplicationSecret = {
  tenantId: 'mock_tenant_id',
  applicationId: mockProtectedApplication.id,
  name: 'Default secret',
  value: 'app_secret',
  createdAt: Date.now(),
  expiresAt: null,
};

const findApplicationById = jest.fn(async (): Promise<Application> => mockProtectedApplication);
const insert = jest.fn(async (data: Partial<ApplicationSecret>) => ({
  ...mockApplicationSecret,
  ...data,
}));
const deleteByName = jest.fn();
const update = jest.fn(async ({ set }: { set: Partial<ApplicationSecret> }) => ({
  ...mockApplicationSecret,
  ...set,
}));
const syncAppConfigsToRemote = jest.fn();

const tenantContext = new MockTenant(
  undefined,
  {
    applications: {
      findApplicationById,
    },
    applicationSecrets: {
      insert,
      deleteByName,
      update,
    },
  },
  undefined,
  {
    protectedApps: {
      syncAppConfigsToRemote,
    },
  }
);

const applicationSecretRoutes = await pickDefault(import('./application-secret.js'));

describe('application secret routes', () => {
  const applicationSecretRequest = createRequester({
    authedRoutes: applicationSecretRoutes,
    tenantContext,
  });

  afterEach(() => {
    findApplicationById.mockClear();
    insert.mockClear();
    deleteByName.mockClear();
    update.mockClear();
    syncAppConfigsToRemote.mockClear();
  });

  it('POST /applications/:id/secrets should resync protected app configs', async () => {
    const response = await applicationSecretRequest
      .post(`/applications/${mockProtectedApplication.id}/secrets`)
      .send({ name: 'New secret' });

    expect(response.status).toEqual(201);
    expect(syncAppConfigsToRemote).toHaveBeenCalledWith(mockProtectedApplication.id);
  });

  it('POST /applications/:id/secrets should succeed if protected app config resync fails', async () => {
    syncAppConfigsToRemote.mockRejectedValueOnce(new Error('sync failed'));

    const response = await applicationSecretRequest
      .post(`/applications/${mockProtectedApplication.id}/secrets`)
      .send({ name: 'New secret' });

    expect(response.status).toEqual(201);
    expect(syncAppConfigsToRemote).toHaveBeenCalledWith(mockProtectedApplication.id);
  });

  it('DELETE /applications/:id/secrets/:name should resync protected app configs', async () => {
    const response = await applicationSecretRequest.delete(
      `/applications/${mockProtectedApplication.id}/secrets/${encodeURIComponent(
        mockApplicationSecret.name
      )}`
    );

    expect(response.status).toEqual(204);
    expect(syncAppConfigsToRemote).toHaveBeenCalledWith(mockProtectedApplication.id);
  });

  it('DELETE /applications/:id/secrets/:name should succeed if protected app config resync fails', async () => {
    syncAppConfigsToRemote.mockRejectedValueOnce(new Error('sync failed'));

    const response = await applicationSecretRequest.delete(
      `/applications/${mockProtectedApplication.id}/secrets/${encodeURIComponent(
        mockApplicationSecret.name
      )}`
    );

    expect(response.status).toEqual(204);
    expect(syncAppConfigsToRemote).toHaveBeenCalledWith(mockProtectedApplication.id);
  });

  it('PATCH /applications/:id/secrets/:name should resync protected app configs', async () => {
    const response = await applicationSecretRequest
      .patch(
        `/applications/${mockProtectedApplication.id}/secrets/${encodeURIComponent(
          mockApplicationSecret.name
        )}`
      )
      .send({ name: 'Renamed secret' });

    expect(response.status).toEqual(200);
    expect(syncAppConfigsToRemote).toHaveBeenCalledWith(mockProtectedApplication.id);
  });

  it('PATCH /applications/:id/secrets/:name should succeed if protected app config resync fails', async () => {
    syncAppConfigsToRemote.mockRejectedValueOnce(new Error('sync failed'));

    const response = await applicationSecretRequest
      .patch(
        `/applications/${mockProtectedApplication.id}/secrets/${encodeURIComponent(
          mockApplicationSecret.name
        )}`
      )
      .send({ name: 'Renamed secret' });

    expect(response.status).toEqual(200);
    expect(syncAppConfigsToRemote).toHaveBeenCalledWith(mockProtectedApplication.id);
  });

  it('should skip resync for non-protected apps', async () => {
    findApplicationById.mockResolvedValueOnce({
      ...mockApplication,
      type: ApplicationType.Traditional,
    });

    const response = await applicationSecretRequest
      .post(`/applications/${mockApplication.id}/secrets`)
      .send({ name: 'New secret' });

    expect(response.status).toEqual(201);
    expect(syncAppConfigsToRemote).not.toHaveBeenCalled();
  });
});
