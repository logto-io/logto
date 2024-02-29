import { got } from 'got';

import { logtoConsoleUrl } from '#src/constants.js';

describe('social connector form post callback', () => {
  const request = got.extend({
    prefixUrl: new URL(logtoConsoleUrl),
  });

  it('should redirect to the same path with query string', async () => {
    const response = await request.post('callback/some_connector_id', {
      json: { some: 'data' },
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/callback/some_connector_id?some=data');
  });
});
