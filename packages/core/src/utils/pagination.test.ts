import { buildLink } from './pagination.js';

const request = {
  origin: 'https://logto.dev',
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
});
