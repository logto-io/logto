import Koa from 'koa';
import request from 'supertest';

/**
 * Need to mock env variables ahead
 */
process.env = {
  ...process.env,
  UI_SIGN_IN_ROUTE: '/sign-in',
  OIDC_PROVIDER_PRIVATE_KEY_BASE64:
    'LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlDV2dJQkFBS0JnR3pLendQcVp6Q3dncjR5a0U1NTN2aWw3QTZYM2l1VnJ3TVJtbVJDTVNBL3lkUm04bXA1CjlHZUYyMlRCSVBtUEVNM29Lbnk4KytFL2FDRnByWXVDa0loREhodVR5N1diT25nd3kyb3JpYnNEQm1OS3FybTkKM0xkYWYrZm1aU2tsL0FMUjZNeUhNV2dTUkQrbFhxVnplNFdSRGIzVTlrTyt3RmVXUlNZNmlRL2pBZ01CQUFFQwpnWUJOZkczUjVpUTFJNk1iZ0x3VGlPM3N2NURRSEE3YmtETWt4bWJtdmRacmw4TlRDemZoNnBiUEhTSFVNMUlmCkxXelVtMldYanFzQUZiOCsvUnZrWDh3OHI3SENNUUdLVGs0ay9adkZ5YUhkM2tIUXhjSkJPakNOUUtjS2NZalUKRGdnTUVJeW5PblNZNjJpWEV6RExKVTJEMVUrY3JEbTZXUTVHaG1NS1p2Vnl3UUpCQU1lcFBFV2gwakNDOEdmQwpQQU1yT1JvOHJYeHYwVEdXNlJWYmxad0ppdjhNeGZacnpZT1cwZUFPek9IK0ZRWE90SjNTdUZONzdEcVQ5TDI3CmN2M3QySkVDUVFDTGZZeVl2ZUg0UnY2bnVET0RnckkzRUJHMFNJbURHcC94UUV2NEk5Z0hrRFF0aFF4bW5xNTEKZ1QxajhFN1lmRHEwMTkvN2htL3dmMXNzMERQNkpic3pBa0JqOEUzKy9MVGRHMjJDUWpNUDB2N09KemtmWkVqdAo3WC9WOVBXNkdQeStGWUt4aWR4ZzFZbFFBWmlFTms0SGppUFNLN3VmN2hPY2JwcStyYWt0ZVhSQkFrQmhaaFFECkh5c20wbVBFTnNGNWhZdnRHTUpUOFFaYnpmNTZWUnYyc3dpSUYyL25qT3hneDFJbjZFczJlamlEdnhLNjdiV1AKQ29zbEViaFhMVFh0NStTekFrQjJQOUYzNExubE9tVjh4Zjk1VmVlcXNPbDFmWWx2Uy9vUUx1a2ZxVkJsTmtzNgpzdmNLVDJOQjlzSHlCeE8vY3Zqa0ZpWXdHR2MzNjlmQklkcDU1S2IwCi0tLS0tRU5EIFJTQSBQUklWQVRFIEtFWS0tLS0t',
};

/* eslint-disable import/first */
import initI18n from '../i18n/init';
import initApp from './init';
/* eslint-enable import/first */

describe('App Init', () => {
  jest.mock('jose/jwk/from_key_like', () => ({
    fromKeyLike: jest.fn(),
  }));

  it('app init properly with 404 not found route', async () => {
    const app = new Koa();
    await initI18n();
    const server = await initApp(app);
    const response = await request(app.callback()).get('/oidc/test');
    expect(response.status).toBe(404);
    server.close();
  });
});
