import { generateRandomString, parseQueryParameters } from '.';

describe('util methods', () => {
  it('generateRandomString', () => {
    const random = generateRandomString();
    expect(random).not.toBeNull();
  });

  it('parseQueryParameters', () => {
    const parameters = parseQueryParameters('?foo=test&bar=test2');
    expect(parameters).toEqual({ foo: 'test', bar: 'test2' });
  });
});
