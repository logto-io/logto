import { createRequester } from '#src/utils/test-utils.js';

import { EnvSet } from '../env-set/index.js';

import statusRoutes from './status.js';

describe('status router', () => {
  const requester = createRequester({ anonymousRoutes: statusRoutes });

  it('should respond with status 204', async () => {
    const response = await requester.get('/status');

    expect(response.status).toBe(204);
    expect(response.headers).not.toHaveProperty('logto-tenant-id');
  });

  it('should not respond with tenant ID when no API key is set', async () => {
    const response = await requester.get('/status').set('logto-status-api-key', 'any-key');

    expect(response.status).toBe(204);
    expect(response.headers).not.toHaveProperty('logto-tenant-id');
  });
});

describe('status router with API key set', () => {
  const testApiKey = 'test-status-api-key';
  const originalApiKey = EnvSet.values.statusApiKey;

  beforeEach(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    Object.defineProperty(EnvSet.values, 'statusApiKey', {
      value: testApiKey,
    });
  });

  afterEach(() => {
    // Restore original API key
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    Object.defineProperty(EnvSet.values, 'statusApiKey', {
      value: originalApiKey,
    });
  });

  it('should respond with tenant ID when valid API key is provided', async () => {
    const requester = createRequester({ anonymousRoutes: statusRoutes });

    const response = await requester.get('/status').set('logto-status-api-key', testApiKey);
    expect(response.headers).toHaveProperty('logto-tenant-id', 'mock_id');
  });

  it('should not respond with tenant ID when invalid API key is provided', async () => {
    const requester = createRequester({ anonymousRoutes: statusRoutes });

    const response = await requester.get('/status').set('logto-status-api-key', 'invalid-api-key');

    expect(response.status).toBe(204);
    expect(response.headers).not.toHaveProperty('logto-tenant-id');
  });
});
