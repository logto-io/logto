import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import {
  expectUnsavedChangesAlert,
  goToAdminConsole,
  trySaveChanges,
  waitForSuccessToast,
} from '#src/ui-helpers/index.js';
import { expectNavigation, appendPathname } from '#src/utils.js';

import {
  socialConnectorTestCases,
  type SocialConnectorCase,
} from './social-connector-test-cases.js';

await page.setViewport({ width: 1920, height: 1080 });

describe('social connectors', () => {
  const logtoConsoleUrl = new URL(logtoConsoleUrlString);

  beforeAll(async () => {
    await goToAdminConsole();
  });

  it('navigate to social connector page', async () => {
    await expectNavigation(
      page.goto(appendPathname('/console/connectors/social', logtoConsoleUrl).href)
    );

    await expect(page).toMatchElement(
      'div[class$=main] div[class$=headline] div[class$=titleEllipsis]',
      {
        text: 'Connectors',
      }
    );

    await expect(page).toMatchElement('nav div[class$=item] div[class$=selected] a', {
      text: 'Social connectors',
    });

    expect(page.url()).toBe(new URL(`console/connectors/social`, logtoConsoleUrl).href);
  });

  it('can open create connector modal from table placeholder', async () => {
    await expect(page).toClick('table div[class$=placeholder] button span', {
      text: 'Add Social Connector',
    });

    await expect(page).toMatchElement(
      '.ReactModalPortal div[class$=header] div[class$=titleEllipsis]',
      {
        text: 'Add Social Connector',
      }
    );

    // Close modal
    await page.keyboard.press('Escape');
  });

  it.each(socialConnectorTestCases)(
    'can create and modify a(n) $factoryId social connector',
    async ({
      groupFactoryId,
      factoryId,
      name,
      initialFormData,
      updateFormData,
      errorFormData,
      standardBasicFormData,
    }: SocialConnectorCase) => {
      await expect(page).toClick('div[class$=headline] button[class$=withIcon] span', {
        text: 'Add Social Connector',
      });

      await expect(page).toMatchElement(
        '.ReactModalPortal div[class$=header] div[class$=titleEllipsis]',
        {
          text: 'Add Social Connector',
        }
      );

      if (groupFactoryId) {
        // Platform selector
        await page.click(
          `.ReactModalPortal div[role=radio]:has(input[name=group][value=${groupFactoryId}])`
        );

        await page.waitForSelector(
          '.ReactModalPortal div[class$=platforms] div[class$=radioGroup]'
        );

        await page.click(
          `.ReactModalPortal div[class$=platforms] div[role=radio]:has(input[name=connector][value=${factoryId}])`
        );
      } else {
        await page.click(
          `.ReactModalPortal div[role=radio]:has(input[name=group][value=${factoryId}])`
        );
      }

      await expect(page).toClick('.ReactModalPortal div[class$=footer] button:not(disabled) span', {
        text: 'Next',
      });

      await expect(page).toMatchElement('.ReactModalPortal div[class$=titleEllipsis] span', {
        text: name,
      });

      await expect(page).toMatchElement('.ReactModalPortal div[class$=subtitle] span', {
        text: 'A step by step guide to configure your connector',
      });

      await expect(page).toClick(
        '.ReactModalPortal form div[class$=footer] button[type=submit] span',
        {
          text: 'Save and Done',
        }
      );

      // Display error input
      await page.waitForSelector('form div[class$=field] div[class$=error]');

      await expect(page).toFillForm('.ReactModalPortal form', {
        ...standardBasicFormData,
        ...initialFormData,
      });

      await expect(page).toClick(
        '.ReactModalPortal form div[class$=footer] button[type=submit] span',
        {
          text: 'Save and Done',
        }
      );

      await waitForSuccessToast(page, 'Saved');

      await expect(page).toMatchElement('div[class$=header] div[class$=name] span', {
        text: name,
      });

      // Fill incorrect form
      await expect(page).toFillForm('form', errorFormData);

      await trySaveChanges(page);

      await page.waitForSelector('form div[class$=field] div[class$=error]');

      // Update form
      await expect(page).toFillForm('form', updateFormData);

      await expectUnsavedChangesAlert(page);

      await trySaveChanges(page);

      await waitForSuccessToast(page, 'Saved');

      // Delete connector
      await expect(page).toClick(
        'div[class$=header] div[class$=operations] button[class$=withIcon]:has(span[class$=icon] > svg[class$=moreIcon])'
      );

      await expect(page).toMatchElement(
        '.ReactModalPortal div[class$=dropdownContainer] div[class$=dropdownTitle]',
        {
          text: 'MORE OPTIONS',
        }
      );

      // Wait for the dropdown menu to be rendered in the correct position
      await page.waitForTimeout(500);

      await expect(page).toClick(
        '.ReactModalPortal div[class$=dropdownContainer] div[role=menuitem]',
        { text: 'Delete' }
      );

      await page.waitForSelector(
        '.ReactModalPortal div[class$=dropdownContainer] div[class$=dropdownTitle]',
        {
          hidden: true,
        }
      );

      await expect(page).toMatchElement(
        '.ReactModalPortal div[class$=header] div[class$=titleEllipsis]',
        {
          text: 'Reminder',
        }
      );

      await expect(page).toClick('.ReactModalPortal div[class$=footer] button span', {
        text: 'Delete',
      });

      await waitForSuccessToast(page, 'The connector has been successfully deleted');

      expect(page.url()).toBe(new URL(`console/connectors/social`, logtoConsoleUrl).href);
    }
  );
});
