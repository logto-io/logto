import { api } from '@/api';

describe('Health check', () => {
  it('should have a health state', async () => {
    expect(await api.get('status')).toHaveProperty('statusCode', 204);
  });
});
