import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import { goToAdminConsole } from '#src/ui-helpers/index.js';
import { expectNavigation, appendPathname, waitFor } from '#src/utils.js';

import { waitForFormCard, expectToSelectColor, expectToSaveSignInExperience } from './helpers.js';

const defaultPrimaryColor = '#6139F6';
const testPrimaryColor = '#5B4D8E';

await page.setViewport({ width: 1920, height: 1080 });

describe('sign-in experience: branding', () => {
  const logtoConsoleUrl = new URL(logtoConsoleUrlString);

  beforeAll(async () => {
    await goToAdminConsole();
  });

  it('navigate to sign-in experience page', async () => {
    await expectNavigation(
      page.goto(appendPathname('/console/sign-in-experience', logtoConsoleUrl).href)
    );

    await expect(page).toMatchElement(
      'div[class$=main] div[class$=container] div[class$=cardTitle] div[class$=titleEllipsis]',
      {
        text: 'Sign-in experience',
      }
    );

    // Start & finish guide
    await expect(page).toClick('div[class$=container] div[class$=content] button span', {
      text: 'Get started',
    });

    await expect(page).toClick(
      'div[class$=ReactModalPortal] div[class$=footerContent] > button span',
      {
        text: 'Done',
      }
    );

    // Land on branding tab by default
    expect(page.url()).toBe(new URL(`console/sign-in-experience/branding`, logtoConsoleUrl).href);

    // Wait for the branding tab to load
    await waitForFormCard(page, 'BRANDING AREA');
    await waitForFormCard(page, 'Custom CSS');
  });

  it('update branding config', async () => {
    // Enabled dark mode
    await expect(page).toClick(
      'form div[class$=field] label[class$=switch]:has(input[name="color.isDarkModeEnabled"])'
    );

    // Update brand color
    await expectToSelectColor(page, {
      field: 'Brand color',
      color: testPrimaryColor,
    });

    // Recalculate dark brand color
    await expect(page).toClick('div[class$=darkModeTip] button span', { text: 'Recalculate' });

    // Wait for the recalculate to finish
    await waitFor(500);

    // Fill in the custom CSS
    await expect(page).toFill('div[class$=editor] textarea', 'body { background-color: #5B4D8E; }');

    await expectToSaveSignInExperience(page);
  });

  it('reset branding config', async () => {
    // Reset branding config
    await expectToSelectColor(page, {
      field: 'Brand color',
      color: defaultPrimaryColor,
    });

    // Recalculate dark brand color
    await expect(page).toClick('div[class$=darkModeTip] button span', { text: 'Recalculate' });

    // Wait for the recalculate to finish
    await waitFor(500);

    // Fill in the custom CSS
    await expect(page).toFill('div[class$=editor] textarea', '');

    await expectToSaveSignInExperience(page);

    // Disable dark mode
    await expect(page).toClick(
      'form div[class$=field] label[class$=switch]:has(input[name="color.isDarkModeEnabled"])'
    );

    await expectToSaveSignInExperience(page);
  });
});
