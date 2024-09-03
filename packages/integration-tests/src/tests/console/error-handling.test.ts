import { appendPath } from '@silverhand/essentials';

import ExpectConsole from '#src/ui-helpers/expect-console.js';
import { Trace } from '#src/ui-helpers/trace.js';
import { devFeatureTest } from '#src/utils.js';

describe('error handling', () => {
  const trace = new Trace();

  devFeatureTest.it('should handle dynamic import errors', async () => {
    const expectConsole = new ExpectConsole(await browser.newPage());
    const path = appendPath(expectConsole.options.endpoint, 'console/__internal__/import-error');

    trace.reset(expectConsole.page);
    await trace.start();
    await expectConsole.navigateTo(path);
    await trace.stop();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    const traceData: { traceEvents: any[] } = await trace.read();

    const documentLoads = traceData.traceEvents.filter((item) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = item?.args?.data ?? {};
      return (
        data.resourceType === 'Document' && data.requestMethod === 'GET' && data.url === path.href
      );
    });

    // Reloaded once
    expect(documentLoads).toHaveLength(2);

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
