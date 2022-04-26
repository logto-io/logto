import { generateRandomString, parseQueryParameters, queryStringfy, getSearchParameters } from '.';

describe('util methods', () => {
  it('generateRandomString', () => {
    const random = generateRandomString();
    expect(random).not.toBeNull();
  });

  it('parseQueryParameters', () => {
    const parameters = parseQueryParameters('?foo=test&bar=test2');
    expect(parameters).toEqual({ foo: 'test', bar: 'test2' });
  });

  it('queryStringfy', () => {
    expect(queryStringfy('foo=test')).toEqual('foo=test');
    expect(queryStringfy(new URLSearchParams({ foo: 'test' }))).toEqual('foo=test');
  });

  it('getSearchParameters', () => {
    expect(getSearchParameters('?foo=test&bar=test2', 'foo')).toEqual('test');
    expect(getSearchParameters(new URLSearchParams({ foo: 'test', bar: 'test2' }), 'foo')).toEqual(
      'test'
    );
  });
});
