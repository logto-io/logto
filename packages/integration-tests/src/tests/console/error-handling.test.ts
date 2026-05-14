import { appendPath } from '@silverhand/essentials';

import ExpectConsole from '#src/ui-helpers/expect-console.js';
import { Trace } from '#src/ui-helpers/trace.js';
import { devFeatureTest } from '#src/utils.js';

describe('error handling', () => {
  const trace = new Trace();

  devFeatureTest.it('should handle dynamic import errors', async () => {
    const expectConsole = new ExpectConsole(await browser.newPage());
    const path = appendPath(
      expectConsole.options.endpoint,
      'console',
      '__internal__',
      'import-error'
    );

    trace.reset(expectConsole.page);
    await trace.start();
    await expectConsole.navigateTo(path);

    const expectedUrl = new URL(path.href);
    const expectedOrigin = expectedUrl.origin;
    const expectedPathname = expectedUrl.pathname.replace(/\/$/, '') || '/';

    const matchesExpectedDocumentPathname = (pathname: string): boolean => {
      const normalized = pathname.replace(/\/$/, '') || '/';
      if (normalized === expectedPathname) {
        return true;
      }
      // Allow prefixed console deployments (extra path segments before the console path),
      // but require the same terminal path as the navigation target and a `/` boundary so
      // unrelated routes cannot match on a short shared suffix alone.
      if (!normalized.endsWith(expectedPathname)) {
        return false;
      }
      if (normalized.length === expectedPathname.length) {
        return true;
      }
      return normalized[normalized.length - expectedPathname.length - 1] === '/';
    };

    const resolveTraceUrl = (rawUrl: string): URL | undefined => {
      try {
        return new URL(rawUrl, expectedOrigin);
      } catch {
        return undefined;
      }
    };

    await trace.stop();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    const traceData: { traceEvents: any[] } = await trace.read();

    const documentLoadEvents = traceData.traceEvents.filter((item) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const raw = item?.args?.data ?? {};
      const data = raw as Record<string, unknown>;

      if (data.resourceType !== 'Document') {
        return false;
      }

      const { requestMethod, url } = data;
      if (requestMethod !== undefined && String(requestMethod).toUpperCase() !== 'GET') {
        return false;
      }

      if (typeof url !== 'string') {
        return false;
      }

      const resolved = resolveTraceUrl(url);
      if (!resolved || resolved.origin !== expectedOrigin) {
        return false;
      }

      const { pathname } = resolved;
      return matchesExpectedDocumentPathname(pathname);
    });

    // Initial navigation plus one automatic reload after the lazy chunk fails (Vite / browser).
    expect(documentLoadEvents.length).toBeGreaterThanOrEqual(1);
    expect(documentLoadEvents.length).toBeLessThanOrEqual(2);

    // Show the error message
    await Promise.all([
      expectConsole.toMatchElement('label', {
        text: 'Oops! Something went wrong.',
      }),
      expectConsole.toMatchElement('span', {
        text: 'Failed to fetch dynamically imported module',
      }),
      expectConsole.toMatchElement('button', {
        text: 'Try again',
      }),
    ]);
  });
});
