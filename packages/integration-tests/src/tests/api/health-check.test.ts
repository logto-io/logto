import { api } from '#src/api/index.js';

describe('health check', () => {
  it('should have a health state', async () => {
    expect(await api.get('status')).toHaveProperty('status', 204);
  });
});
