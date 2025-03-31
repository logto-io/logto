import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import { expectToClickNavTab, goToAdminConsole } from '#src/ui-helpers/index.js';
import { expectNavigation, appendPathname } from '#src/utils.js';

import { waitForFormCard } from '../helpers.js';

await page.setViewport({ width: 1920, height: 1080 });

describe('sign-in experience(sad path): sign-up and sign-in', () => {
  const logtoConsoleUrl = new URL(logtoConsoleUrlString);

  beforeAll(async () => {
    await goToAdminConsole();
  });

  it('navigate to sign-in experience page', async () => {
    await expectNavigation(
      page.goto(appendPathname('/console/sign-in-experience', logtoConsoleUrl).href)
    );
    // Land on branding tab by default
    expect(page.url()).toBe(new URL(`console/sign-in-experience/branding`, logtoConsoleUrl).href);
  });

  it('navigate to sign-up and sign-in tab', async () => {
    await expectToClickNavTab(page, 'Sign-up and sign-in');

    await waitForFormCard(page, 'SIGN UP');
    await waitForFormCard(page, 'SIGN IN');
    await waitForFormCard(page, 'SOCIAL SIGN-IN');
  });
});
