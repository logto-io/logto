import { adminTenantApi } from '#src/api/api.js';

describe('status API', () => {
  it('should respond with status 204', async () => {
    const response = await adminTenantApi.get('status');
    expect(response.status).toBe(204);
    expect(response.headers).not.toHaveProperty('logto-tenant-id');
  });

  it('should respond with tenant ID when valid API key is provided', async () => {
    const response = await adminTenantApi.get('status', {
      headers: {
        'logto-status-api-key': 'test-status-api-key',
      },
    });
    expect(response.status).toBe(204);
    expect(response.headers.get('logto-tenant-id')?.length).toBeGreaterThan(0);
  });

  it('should not respond with tenant ID when invalid API key is provided', async () => {
    const response = await adminTenantApi.get('status', {
      headers: {
        'logto-status-api-key': 'invalid-api-key',
      },
    });
    expect(response.status).toBe(204);
    expect(response.headers).not.toHaveProperty('logto-tenant-id');
  });
});
