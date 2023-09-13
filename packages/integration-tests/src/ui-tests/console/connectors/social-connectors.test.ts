import { ConnectorType } from '@logto/connector-kit';

import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import {
  expectToClickDetailsPageOption,
  expectUnsavedChangesAlert,
  goToAdminConsole,
  expectToSaveChanges,
  waitForToast,
  expectModalWithTitle,
} from '#src/ui-helpers/index.js';
import { expectNavigation, appendPathname } from '#src/utils.js';

import {
  expectToConfirmConnectorDeletion,
  expectToSelectConnector,
  waitForConnectorCreationGuide,
} from './helpers.js';
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

    await expectModalWithTitle(page, 'Add Social Connector');

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

      await expectToSelectConnector(page, {
        groupFactoryId,
        factoryId,
        connectorType: ConnectorType.Social,
      });

      await waitForConnectorCreationGuide(page, name);

      // Save with empty form
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

      await waitForToast(page, { text: 'Saved' });

      await expect(page).toMatchElement('div[class$=header] div[class$=name] span', {
        text: name,
      });

      // Fill incorrect form
      await expect(page).toFillForm('form', errorFormData);

      await expectToSaveChanges(page);

      await page.waitForSelector('form div[class$=field] div[class$=error]');

      // Update form
      await expect(page).toFillForm('form', updateFormData);

      await expectUnsavedChangesAlert(page);

      await expectToSaveChanges(page);

      await waitForToast(page, { text: 'Saved' });

      // Delete connector
      await expectToClickDetailsPageOption(page, 'Delete');

      await expectToConfirmConnectorDeletion(
        page,
        new URL(`console/connectors/social`, logtoConsoleUrl).href
      );
    }
  );
});
