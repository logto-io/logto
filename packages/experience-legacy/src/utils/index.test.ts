import { generateRandomString, parseQueryParameters, queryStringify, getSearchParameters } from '.';

describe('util methods', () => {
  it('generateRandomString', () => {
    const random = generateRandomString();
    expect(random).not.toBeNull();
  });

  it('parseQueryParameters', () => {
    const parameters = parseQueryParameters('?foo=test&bar=test2');
    expect(parameters).toEqual({ foo: 'test', bar: 'test2' });
  });

  it('parseQueryParameters with encoded url', () => {
    const url = 'http://logto.io';
    const parameters = parseQueryParameters(`?callback=${encodeURIComponent(url)}`);
    expect(parameters).toEqual({ callback: url });
  });

  it('queryStringify', () => {
    expect(queryStringify(new URLSearchParams({ foo: 'test' }))).toEqual('foo=test');
  });

  it('getSearchParameters', () => {
    expect(getSearchParameters('?foo=test&bar=test2', 'foo')).toEqual('test');
    expect(getSearchParameters(new URLSearchParams({ foo: 'test', bar: 'test2' }), 'foo')).toEqual(
      'test'
    );
  });
});
