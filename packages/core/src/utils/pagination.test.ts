import { buildLink } from './pagination.js';

const request = {
  URL: new URL('https://logto.dev/users?order=desc&page=3'),
  path: '/users',
  query: { order: 'desc', page: '3' },
};

describe('buildLink()', () => {
  it('build a `first` link', () => {
    const link = buildLink(request, 1, 'first');
    expect(link).toEqual('<https://logto.dev/users?order=desc&page=1>; rel="first"');
  });

  it('build a `prev` link', () => {
    const link = buildLink(request, 2, 'prev');
    expect(link).toEqual('<https://logto.dev/users?order=desc&page=2>; rel="prev"');
  });

  it('build a `next` link', () => {
    const link = buildLink(request, 4, 'next');
    expect(link).toEqual('<https://logto.dev/users?order=desc&page=4>; rel="next"');
  });

  it('build a `last` link', () => {
    const link = buildLink(request, 10, 'last');
    expect(link).toEqual('<https://logto.dev/users?order=desc&page=10>; rel="last"');
  });

  it('build a relative link when the request URL cannot be parsed', () => {
    /** Koa memoizes a null-prototype object when the request URL cannot be parsed. */
    const link = buildLink({ ...request, URL: Object.create(null) as URL }, 1, 'first');
    expect(link).toEqual('</users?order=desc&page=1>; rel="first"');
  });
});
