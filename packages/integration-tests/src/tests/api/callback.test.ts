import ky from 'ky';

import { logtoConsoleUrl } from '#src/constants.js';

describe('social connector form post callback', () => {
  const request = ky.extend({
    prefixUrl: new URL(logtoConsoleUrl),
  });

  it('should redirect to the same path with query string', async () => {
    const response = await request.post('callback/some_connector_id', {
      json: { some: 'data' },
      redirect: 'manual',
      throwHttpErrors: false,
    });

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('/callback/some_connector_id?some=data');
  });
});
