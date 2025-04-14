import ky, { HTTPError } from 'ky';

import { logtoConsoleUrl, logtoUrl } from '#src/constants.js';

const apps = [
  { name: 'experience', app: ky.extend({ prefixUrl: new URL(logtoUrl) }) },
  { name: 'console', app: ky.extend({ prefixUrl: new URL(logtoConsoleUrl) }) },
];

describe.each(apps)('single page app: %s', ({ app }) => {
  it('should fall back to index.html when the path is not found', async () => {
    const body = await app.get('non-existing-path').text();
    expect(body).toContain('</html>');
  });

  it('should return 404 for non-existing path in the `/assets` folder', async () => {
    const response = await app.get('assets/non-existing-path').catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.status === 404).toBe(true);
  });
});
