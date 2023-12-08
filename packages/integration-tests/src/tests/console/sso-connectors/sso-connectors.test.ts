import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import {
  goToAdminConsole,
  expectModalWithTitle,
  expectToClickDetailsPageOption,
  expectConfirmModalAndAct,
  expectToSaveChanges,
  waitForToast,
} from '#src/ui-helpers/index.js';
import { expectNavigation, appendPathname } from '#src/utils.js';

import { findModalFooterButton, fillSsoConnectorCreationModal } from './helpers.js';
import { ssoConnectorTestCases } from './sso-connectors-test-cases.js';

await page.setViewport({ width: 1920, height: 1080 });

describe('create SSO connectors', () => {
  const logtoConsoleUrl = new URL(logtoConsoleUrlString);

  beforeAll(async () => {
    // Enter admin console
    await goToAdminConsole();
  });

  it('navigate to Enterprise SSO connectors listing page', async () => {
    await expectNavigation(
      page.goto(appendPathname('/console/enterprise-sso', logtoConsoleUrl).href)
    );

    await expect(page).toMatchElement(
      'div[class$=main] div[class$=headline] div[class$=titleEllipsis]',
      {
        text: 'Enterprise SSO',
      }
    );

    expect(page.url()).toBe(new URL(`console/enterprise-sso`, logtoConsoleUrl).href);
  });

  it('can open create SSO connector modal from table placeholder and create the first SSO connector', async () => {
    // When no SSO connector is created, use the create button in placeholder.
    await expect(page).toClick('table div[class$=placeholder] button span', {
      text: 'Add enterprise connector',
    });

    await expectModalWithTitle(page, 'Add enterprise connector');

    await fillSsoConnectorCreationModal(page, ssoConnectorTestCases[0]!);

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Come back to Enterprise SSO listing page.
    await page.goto(appendPathname('/console/enterprise-sso', logtoConsoleUrl).href);
  });

  it.each(ssoConnectorTestCases.slice(1))(
    'create other SSO connectors %p',
    async (ssoConnector) => {
      await page.waitForNavigation({ waitUntil: 'networkidle0' });

      // When there are existing SSO connector(s), use the create button in page header.
      await expect(page).toClick('div[class$=main] div[class$=headline] button[type=button] span', {
        text: 'Add enterprise connector',
      });

      await expectModalWithTitle(page, 'Add enterprise connector');

      await fillSsoConnectorCreationModal(page, ssoConnector);

      await page.waitForNavigation({ waitUntil: 'networkidle0' });

      // Come back to Enterprise SSO listing page.
      await page.goto(appendPathname('/console/enterprise-sso', logtoConsoleUrl).href);
    }
  );

  it('should block the create of SSO connector with a duplicated name', async () => {
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // When there are existing SSO connector(s), use the create button in page header.
    await expect(page).toClick('div[class$=main] div[class$=headline] button[type=button] span', {
      text: 'Add enterprise connector',
    });

    await expectModalWithTitle(page, 'Add enterprise connector');

    /**
     * To check only the `duplicated connector name` is blocked, even if the
     * existing SSO connector (with the occupied name) is created with a different connector factory.
     */
    const { connectorFactoryName } = ssoConnectorTestCases[0]!;
    const { connectorName } = ssoConnectorTestCases[1]!;
    await fillSsoConnectorCreationModal(page, {
      connectorFactoryName,
      connectorName,
    });

    // Error message should be shown.
    await expect(page).toMatchElement(
      '.ReactModalPortal div[class$=field] div[class$=errorMessage]',
      {
        text: 'Connector name already exists. Please choose a different name.',
      }
    );

    await expect(findModalFooterButton(true)).resolves.toBeTruthy();

    await expect(page).toFill(
      '.ReactModalPortal input[type=text][name=connectorName]',
      `${connectorName} (1)`
    );

    // Button should enabled.
    const createButton = await findModalFooterButton();
    await createButton?.click();

    // Wait until the user is redirected to the details page.
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    /**
     * If the page still shows the modal, the URL ends with `/enterprise-sso/create`;
     * if the SSO connector is successfully created, user is redirected to the details
     * page `/enterprise-sso/${id}` and then automatically be redirected to `/enterprise-sso/${id}/connection` (default tab).
     */
    expect(page.url().endsWith('/enterprise-sso/create')).toBeFalsy();
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    expect(page.url().endsWith('/connection')).toBeTruthy();
  });

  it("can go to SSO connector's 'SSO Experience' tab", async () => {
    // Navigate to "SSO Experience" tab
    await expect(page).toClick('nav div[class$=item] div[class$=link] a', {
      text: 'SSO Experience',
    });

    // Confirm the current path is for "SSO Experience".
    expect(page.url().endsWith('/experience')).toBeTruthy();
    // Confirm the current tab is "SSO Experience".
    await expect(page).toMatchElement('nav div[class$=item] div[class$=selected] a', {
      text: 'SSO Experience',
    });
  });

  it("can configure SSO connectors's 'SSO Experience' GENERAL setup", async () => {
    // Expect to see inline notification alert to configure email domain.
    await expect(page).toMatchElement(
      'form div[class*=alert][class$=inlineNotification] div[class$=content]',
      {
        text: 'Add email domain to guide enterprise users to their identity provider for Single Sign-on.',
      }
    );

    // Configure email domain
    await expect(page).toFill(
      'form div[class*=input][class*=multiple][role=button] input',
      'svhd.io'
    );

    // Press enter to add email domain
    await page.keyboard.press('Enter');

    // Input email domain with invalid format
    await expect(page).toFill('form div[class*=input][class*=multiple][role=button] input', 'abc');

    // Press space to add email domain
    await page.keyboard.press('Space');
    await expect(page).toMatchElement('form div[class$=field] div[class$=errorMessage]', {
      text: 'Invalid domain format.',
    });

    // Input public email domain (e.g., 'gmail.com', 'yahoo.com' etc)
    await expect(page).toFill(
      'form div[class*=input][class*=multiple][role=button] input',
      'gmail.com'
    );

    // Press tab to add email domain
    await page.keyboard.press('Tab');
    await expect(page).toMatchElement('form div[class$=field] div[class$=errorMessage]', {
      text: 'Public email domains are not allowed. Invalid domain format.',
    });

    // Remove last added email domain (which is `gmail.com` in this case). CSS selector can not specify the text content of the component.
    await expect(page).toClick(
      'form div[class*=input][class*=multiple][role=button] div[class*=info][class*=tag]:last-of-type button'
    );

    // Error message got updated, since forbidden email domain is removed.
    await expect(page).toMatchElement('form div[class$=field] div[class$=errorMessage]', {
      text: 'Invalid domain format.',
    });
    await expect(page).toFill('form div[class*=input][class*=multiple][role=button] input', 'abc');

    // Input field blurred to input email domain.
    await page.$eval(
      'form div[class*=input][class*=multiple][role=button] input',
      (element: HTMLInputElement) => {
        element.blur();
      }
    );

    // Does not allow duplicate email domain.
    await expect(page).toMatchElement('form div[class$=field] div[class$=errorMessage]', {
      text: 'There are duplicate domains. Invalid domain format.',
    });

    // Remove last two added email domains (which are two `abc` in this case).
    await expect(page).toClick(
      'form div[class*=input][class*=multiple][role=button] div[class*=info][class*=tag]:last-of-type button'
    );

    // Focus on email domain input field component (at this time, the input field is empty).
    const inputField = await page.$('form div[class*=input][class*=multiple][role=button] input');
    await inputField?.focus();
    // Should remove the last input email domain with double backspace when the input box is empty.
    await inputField?.press('Backspace');
    await inputField?.press('Backspace');

    // Since incorrect email domains are removed, error message no longer exists.
    const errorMessage = await page.$('form div[class$=field] div[class$=errorMessage]');
    expect(errorMessage).toBeNull();

    await expectToSaveChanges(page);
    await waitForToast(page, { text: 'Saved' });
  });

  it('can delete an SSO connector from details page', async () => {
    // Delete connector
    await expectToClickDetailsPageOption(page, 'Delete');

    await expectConfirmModalAndAct(page, {
      title: 'Delete enterprise SSO connector',
      actionText: 'Delete',
    });

    // Wait to navigate to the connector list page
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    expect(page.url()).toBe(new URL(`console/enterprise-sso`, logtoConsoleUrl).href);
  });
});
