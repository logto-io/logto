import { api } from '#src/api/index.js';

describe('health check', () => {
  it('should have a health state', async () => {
    expect(await api.get('status')).toHaveProperty('status', 204);
  });

  it('should return request id in headers', async () => {
    const { headers } = await api.get('status');
    expect(headers.has('logto-core-request-id')).toBe(true);
  });
});
