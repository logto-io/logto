import { getRequestOrigin } from './request.js';

/** Koa memoizes a null-prototype object when the request URL cannot be parsed. */
const unparsableUrl = Object.create(null) as URL;

describe('getRequestOrigin()', () => {
  it('returns the origin of the request URL', () => {
    expect(getRequestOrigin({ URL: new URL('https://login.customer.com/users?page=1') })).toBe(
      'https://login.customer.com'
    );
  });

  it('returns undefined when the request URL cannot be parsed', () => {
    expect(getRequestOrigin({ URL: unparsableUrl })).toBeUndefined();
  });
});
