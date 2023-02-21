import { createRouter } from '@withtyped/server';

const router = createRouter('/api')
  .get('/status', {}, async (context, next) => next({ ...context, status: 204 }))
  .get('/teapot', {}, async (context, next) =>
    next({ ...context, status: 418, json: { message: 'The server refuses to brew coffee.' } })
  );

export default router;
