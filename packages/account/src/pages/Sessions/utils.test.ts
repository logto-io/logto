import { getDynamicAppDisplayName } from './utils';

const clientId = 'https://client.example.com/oauth/metadata.json';

describe('getDynamicAppDisplayName', () => {
  it('should return the snapshot name when present', () => {
    expect(getDynamicAppDisplayName(clientId, 'Example App')).toBe('Example App');
  });

  it('should return the identifier host when the name is the identifier fallback', () => {
    expect(getDynamicAppDisplayName(clientId, clientId)).toBe('client.example.com');
  });

  it('should return the identifier host when the name is empty', () => {
    expect(getDynamicAppDisplayName(clientId, '')).toBe('client.example.com');
  });

  it('should return the identifier host when the name is omitted', () => {
    expect(getDynamicAppDisplayName(clientId)).toBe('client.example.com');
  });

  it('should keep a non-default port as part of the host', () => {
    expect(getDynamicAppDisplayName('https://client.example.com:8443/metadata.json')).toBe(
      'client.example.com:8443'
    );
  });

  it('should render a malformed identifier as-is instead of throwing', () => {
    expect(getDynamicAppDisplayName('https://')).toBe('https://');
  });
});
