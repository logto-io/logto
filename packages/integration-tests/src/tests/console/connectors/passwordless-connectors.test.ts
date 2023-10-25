import { ConnectorType } from '@logto/connector-kit';

import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import {
  expectToClickDetailsPageOption,
  expectUnsavedChangesAlert,
  goToAdminConsole,
  expectToSaveChanges,
  waitForToast,
} from '#src/ui-helpers/index.js';
import { expectNavigation, appendPathname } from '#src/utils.js';

import {
  expectToConfirmConnectorDeletion,
  expectToSelectConnector,
  findNextCompatibleConnector,
  waitForConnectorCreationGuide,
  expectToTestConnectorConnection,
} from './helpers.js';
import {
  type PasswordlessConnectorCase,
  passwordlessConnectorTestCases,
} from './passwordless-connector-test-cases.js';

await page.setViewport({ width: 1920, height: 1080 });

describe('passwordless connectors', () => {
  const logtoConsoleUrl = new URL(logtoConsoleUrlString);

  beforeAll(async () => {
    await goToAdminConsole();
  });

  it('navigate to passwordless connector page', async () => {
    // Should navigate to passwordless page when visit '/console/connectors'
    await expectNavigation(page.goto(appendPathname('/console/connectors', logtoConsoleUrl).href));
    expect(page.url()).toBe(new URL('/console/connectors/passwordless', logtoConsoleUrl).href);

    await expectNavigation(
      page.goto(appendPathname('/console/connectors/passwordless', logtoConsoleUrl).href)
    );
    expect(page.url()).toBe(new URL('/console/connectors/passwordless', logtoConsoleUrl).href);
  });

  it.each(passwordlessConnectorTestCases)(
    'can setup and modify a(n) $factoryId connector',
    async (connector: PasswordlessConnectorCase) => {
      const { factoryId, isEmailConnector, name, initialFormData, updateFormData, errorFormData } =
        connector;

      const connectorItem = await expect(page).toMatchElement(
        'div[class$=item] div[class$=previewTitle]:has(>div)',
        {
          text: isEmailConnector ? 'Email connector' : 'SMS connector',
        }
      );

      const setupConnectorButton = await expect(connectorItem).toMatchElement('button span', {
        text: 'Set up',
      });

      await setupConnectorButton.click();

      await expectToSelectConnector(page, {
        factoryId,
        connectorType: isEmailConnector ? ConnectorType.Email : ConnectorType.Sms,
      });

      await waitForConnectorCreationGuide(page, name);

      if (initialFormData) {
        await expect(page).toClick(
          '.ReactModalPortal form div[class$=footer] button[type=submit] span',
          {
            text: 'Save and Done',
          }
        );

        // Display error input
        await page.waitForSelector('form div[class$=field] div[class$=error]');

        await expect(page).toFillForm('.ReactModalPortal form', initialFormData);

        // Try click test button
        await expect(page).toClick('.ReactModalPortal div[class$=send] button span', {
          text: 'Send',
        });

        // Display test input error
        await page.waitForSelector('.ReactModalPortal div[class$=error]:has(input[name=sendTo])');
      }

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

      await expectToTestConnectorConnection(page, connector);

      // Test form on details page
      if (errorFormData) {
        // Fill incorrect form
        await expect(page).toFillForm('form', errorFormData);

        await expectToSaveChanges(page);

        await page.waitForSelector('form div[class$=field] div[class$=error]');
      }

      if (updateFormData) {
        // Update form
        await expect(page).toFillForm('form', updateFormData);

        await expectUnsavedChangesAlert(page);

        await expectToSaveChanges(page);

        await waitForToast(page, { text: 'Saved' });
      }

      // Change to next connector
      const nextConnector = findNextCompatibleConnector(connector);

      if (nextConnector) {
        await expectToClickDetailsPageOption(
          page,
          isEmailConnector ? 'Change email connector' : 'Change SMS connector'
        );

        await expectToSelectConnector(page, {
          factoryId: nextConnector.factoryId,
          connectorType: isEmailConnector ? ConnectorType.Email : ConnectorType.Sms,
        });

        await waitForConnectorCreationGuide(page, nextConnector.name);

        if (nextConnector.initialFormData) {
          await expect(page).toFillForm('.ReactModalPortal form', nextConnector.initialFormData);
        }

        await expect(page).toClick(
          '.ReactModalPortal form div[class$=footer] button[type=submit] span',
          {
            text: 'Save and Done',
          }
        );

        await waitForToast(page, { text: 'Saved' });

        await expect(page).toMatchElement('div[class$=header] div[class$=name] span', {
          text: nextConnector.name,
        });
      }

      // Delete email connector
      await expectToClickDetailsPageOption(page, 'Delete');

      await expectToConfirmConnectorDeletion(
        page,
        new URL(`console/connectors/passwordless`, logtoConsoleUrl).href
      );
    }
  );
});
