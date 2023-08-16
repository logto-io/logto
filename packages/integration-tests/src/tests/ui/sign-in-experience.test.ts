import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import { goToAdminConsole, trySaveChanges, waitForToaster } from '#src/ui-helpers/index.js';
import { appendPathname, expectNavigation } from '#src/utils.js';

await page.setViewport({ width: 1920, height: 1080 });

const defaultPrimaryColor = '#6139F6';
const testPrimaryColor = '#5B4D8E';

describe('sign-in experience', () => {
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
      text: 'Get Started',
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
    await expect(page).toMatchElement('div[class$=tabContent] div[class$=card] div[class$=title]', {
      text: 'BRANDING AREA',
    });

    await expect(page).toMatchElement('div[class$=tabContent] div[class$=card] div[class$=title]', {
      text: 'Custom CSS',
    });
  });

  describe('update branding config', () => {
    it('update branding config', async () => {
      // Enabled dark mode
      await expect(page).toClick(
        'form div[class$=field] label[class$=switch]:has(input[name="color.isDarkModeEnabled"])'
      );

      // Update brand color
      const brandColorField = await expect(page).toMatchElement(
        'div[class$=field]:has(div[class$=headline] div[class$=title])',
        {
          text: 'Brand color',
        }
      );

      await expect(brandColorField).toClick('div[role=button]');

      await expect(page).toFill('input[id^=rc-editable-input]', testPrimaryColor);

      // Close the color input
      await page.keyboard.press('Escape');

      // Recalculate dark brand color
      await expect(page).toClick('div[class$=darkModeTip] button span', { text: 'Recalculate' });

      // Wait for the recalculate to finish
      await page.waitForTimeout(500);

      // Fill in the custom CSS
      await expect(page).toFill(
        'div[class$=editor] textarea',
        'body { background-color: #5B4D8E; }'
      );

      await trySaveChanges(page);

      await waitForToaster(page, {
        text: 'Saved',
      });
    });

    it('reset branding config', async () => {
      // Reset branding config
      const brandColorField = await expect(page).toMatchElement(
        'div[class$=field]:has(div[class$=headline] div[class$=title])',
        {
          text: 'Brand color',
        }
      );

      await expect(brandColorField).toClick('div[role=button]');

      await expect(page).toFill('input[id^=rc-editable-input]', defaultPrimaryColor);

      // Close the color input
      await page.keyboard.press('Escape');

      // Recalculate dark brand color
      await expect(page).toClick('div[class$=darkModeTip] button span', { text: 'Recalculate' });

      // Wait for the recalculate to finish
      await page.waitForTimeout(500);

      // Fill in the custom CSS
      await expect(page).toFill('div[class$=editor] textarea', '');

      await trySaveChanges(page);

      await waitForToaster(page, {
        text: 'Saved',
      });

      // Disable dark mode
      await expect(page).toClick(
        'form div[class$=field] label[class$=switch]:has(input[name="color.isDarkModeEnabled"])'
      );

      await trySaveChanges(page);

      await waitForToaster(page, {
        text: 'Saved',
      });
    });
  });
});
