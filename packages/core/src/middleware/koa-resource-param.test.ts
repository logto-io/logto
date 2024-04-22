import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';

const { jest } = import.meta;

const { default: koaResourceParam } = await import('./koa-resource-param.js');

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = async () => {};

const endpoint = 'https://logto.io/oidc/auth';

describe('koaResourceParam() middleware', () => {
  it('should check and process comma separated resource params in the URL', async () => {
    const ctx = createMockContext({ url: endpoint + '?resource=foo,bar' });
    const run = koaResourceParam();

    await run(ctx, noop);

    expect(ctx.request.query).toEqual({
      resource: ['foo', 'bar'],
    });
  });

  it('should also work with both comma separated and single resource params', async () => {
    const ctx = createMockContext({ url: endpoint + '?resource=foo,bar&resource=baz' });
    const run = koaResourceParam();

    await run(ctx, noop);

    expect(ctx.request.query).toEqual({
      resource: ['foo', 'bar', 'baz'],
    });
  });

  it('should not affect the URL if no comma separated resource params are found', async () => {
    const ctx = createMockContext({ url: endpoint + '?resource=foo&resource=bar' });
    const run = koaResourceParam();

    await run(ctx, noop);

    expect(ctx.request.query).toEqual({
      resource: ['foo', 'bar'],
    });
  });
});
