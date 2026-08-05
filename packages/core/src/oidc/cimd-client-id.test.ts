import { isCimdClientId } from './cimd-client-id.js';

describe('isCimdClientId', () => {
  it('matches the fork scheme test case-insensitively and never matches registered ids', () => {
    expect(isCimdClientId('https://client.example.com/metadata.json')).toBe(true);
    expect(isCimdClientId('HTTPS://client.example.com/metadata.json')).toBe(true);
    expect(isCimdClientId('registered_client_id')).toBe(false);
  });
});
