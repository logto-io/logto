import api from '@/api';

describe('Swagger check', () => {
  it('should succeed to provide swagger.json', async () => {
    expect(await api.get('swagger.json')).toHaveProperty('statusCode', 200);
  });
});
