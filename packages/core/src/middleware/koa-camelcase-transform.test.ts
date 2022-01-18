import { createMockContext } from '@shopify/jest-koa-mocks';

import koaCamelcaseTransform, { ResponseKeyCase } from './koa-camelcase-transform';

const next = jest.fn();

describe('koa-camelcase-transform', () => {
  it('should transform body snakecase to camelcase with keycase header camecase', async () => {
    const ctx = createMockContext({
      headers: {
        'response-keycase': ResponseKeyCase.camelcase,
      },
    });

    ctx.body = { redirect_uri: 'foo' };

    await koaCamelcaseTransform()(ctx, next);

    expect(ctx.body).toHaveProperty('redirectUri');
  });

  it('should not transform body to camelcase without keycase header', async () => {
    const ctx = createMockContext();
    ctx.body = { redirect_uri: 'foo' };
    await koaCamelcaseTransform()(ctx, next);

    expect(ctx.body).toHaveProperty('redirect_uri');
  });

  it('should not transform body to camelcase with keycase header not recognized', async () => {
    const ctx = createMockContext({
      headers: {
        'response-keycase': 'dummycase',
      },
    });

    ctx.body = { redirect_uri: 'foo' };
    await koaCamelcaseTransform()(ctx, next);

    expect(ctx.body).toHaveProperty('redirect_uri');
  });
});
