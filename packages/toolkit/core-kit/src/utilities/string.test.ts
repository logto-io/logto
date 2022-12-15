import { generateRandomString } from './string.js';

describe('generateRandomString', () => {
  it('should return a random string with specified length', () => {
    const randomString = generateRandomString(32);
    expect(randomString).toHaveLength(32);
  });

  it('should contain only 0-9, A-Z and a-z by default', () => {
    const randomString = generateRandomString(32);
    expect(() => {
      /[\dA-Za-z]/.test(randomString);
    }).toBeTruthy();
  });
});
