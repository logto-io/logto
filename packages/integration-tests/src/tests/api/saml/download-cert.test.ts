import { samlApi } from '#src/api/api.js';

describe('download-cert', () => {
  it('should download the cert successfully', async () => {
    const response = await samlApi.get('cert');

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toBe('application/x-x509-ca-cert');
    expect(response.body).toContain('BEGIN CERTIFICATE');
  });
});
