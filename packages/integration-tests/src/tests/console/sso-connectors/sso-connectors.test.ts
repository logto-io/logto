import { getSsoConnectors, deleteSsoConnectorById } from '#src/api/sso-connector.js';
import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import {
  goToAdminConsole,
  expectModalWithTitle,
  expectConfirmModalAndAct,
  expectToClickDetailsPageOption,
  expectToSaveChanges,
  waitForToast,
} from '#src/ui-helpers/index.js';
import { expectNavigation, appendPathname, dcls, cls } from '#src/utils.js';

import { fillSsoConnectorCreationModal, findModalFooterButton } from './helpers.js';
import { ssoConnectorTestCases } from './sso-connectors-test-cases.js';

await page.setViewport({ width: 1920, height: 1080 });

const errorMessageSelector = ['form', dcls('field'), dcls('errorMessage')].join(' ');

const emailDomainInputFieldSelector = [
  'form',
  `${dcls('input')}${cls('multiple')}[role=button]`,
  'input',
].join(' ');

const connectorNameInputFieldSelector = ['form', 'input[type=text][name=connectorName]'].join(' ');

describe('create SSO connectors', () => {
  const logtoConsoleUrl = new URL(logtoConsoleUrlString);

  beforeAll(async () => {
    // Enter admin console
    await goToAdminConsole();
  });

  afterAll(async () => {
    // Delete all SSO connectors
    const connectors = await getSsoConnectors();
    await Promise.all(connectors.map(async ({ id }) => deleteSsoConnectorById(id)));
  });

  it('navigate to Enterprise SSO connectors listing page', async () => {
    await expectNavigation(
      page.goto(appendPathname('/console/enterprise-sso', logtoConsoleUrl).href)
    );

    await expect(page).toMatchElement(
      [dcls('main'), dcls('headline'), dcls('titleEllipsis')].join(' '),
      {
        text: 'Enterprise SSO',
      }
    );

    expect(page.url()).toBe(new URL(`console/enterprise-sso`, logtoConsoleUrl).href);
  });

  it('can open create SSO connector modal from table placeholder and create the first SSO connector', async () => {
    // When no SSO connector is created, use the create button in placeholder.
    await expect(page).toClick(['table', dcls('placeholder'), 'button', 'span'].join(' '), {
      text: 'Add enterprise connector',
    });

    await expectModalWithTitle(page, 'Add enterprise connector');

    await fillSsoConnectorCreationModal(page, ssoConnectorTestCases[0]!, true);

    // Come back to Enterprise SSO listing page.
    await page.goto(appendPathname('/console/enterprise-sso', logtoConsoleUrl).href);
  });

  it.each(ssoConnectorTestCases.slice(1))(
    // The full object of `ssoConnector` test case is too burdensome for the test title, so we only use the index here.
    'create other SSO connectors %#',
    async (ssoConnector) => {
      await page.waitForNavigation({ waitUntil: 'networkidle0' });

      // When there are existing SSO connector(s), use the create button in page header.
      await expect(page).toClick(
        [dcls('main'), dcls('headline'), 'button[type=button]', 'span'].join(' '),
        {
          text: 'Add enterprise connector',
        }
      );

      await expectModalWithTitle(page, 'Add enterprise connector');

      await fillSsoConnectorCreationModal(page, ssoConnector, true);

      // Come back to Enterprise SSO listing page.
      await page.goto(appendPathname('/console/enterprise-sso', logtoConsoleUrl).href);
    }
  );

  it('should block the create of SSO connector with a duplicated name', async () => {
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // When there are existing SSO connector(s), use the create button in page header.
    await expect(page).toClick(
      [dcls('main'), dcls('headline'), 'button[type=button]', 'span'].join(' '),
      {
        text: 'Add enterprise connector',
      }
    );

    await expectModalWithTitle(page, 'Add enterprise connector');

    /**
     * To check only the `duplicated connector name` is blocked, even if the
     * existing SSO connector (with the occupied name) is created with a different connector factory.
     */
    const { connectorFactoryName, protocol, formData, previewResults } = ssoConnectorTestCases[0]!;
    const { connectorName } = ssoConnectorTestCases[1]!;
    // Since the creation process is expected to be blocked in this test case, we do not want to check the connection info on details page.
    await fillSsoConnectorCreationModal(page, {
      connectorFactoryName,
      connectorName,
      protocol,
      formData,
      previewResults,
    });

    // Error message should be shown.
    await expect(page).toMatchElement(
      ['.ReactModalPortal', dcls('field'), dcls('errorMessage')].join(' '),
      {
        text: 'Connector name already exists. Please choose a different name.',
      }
    );

    await expect(findModalFooterButton(true)).resolves.toBeTruthy();

    await expect(page).toFill(
      ['.ReactModalPortal', 'input[type=text][name=connectorName]'].join(' '),
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
    await expect(page).toClick(['nav', dcls('item'), dcls('link'), 'a'].join(' '), {
      text: 'SSO Experience',
    });

    // Confirm the current path is for "SSO Experience".
    expect(page.url().endsWith('/experience')).toBeTruthy();
    // Confirm the current tab is "SSO Experience".
    await expect(page).toMatchElement(['nav', dcls('item'), dcls('selected'), 'a'].join(' '), {
      text: 'SSO Experience',
    });
  });

  it("can configure SSO connectors's 'SSO Experience' GENERAL setup: email domain input field", async () => {
    // Expect to see inline notification alert to configure email domain.
    await expect(page).toMatchElement(
      ['form', `${dcls('alert')}${cls('inlineNotification')}`, dcls('content')].join(' '),
      {
        text: 'Add email domain to guide enterprise users to their identity provider for Single Sign-on.',
      }
    );

    // Configure email domain
    await expect(page).toFill(emailDomainInputFieldSelector, 'svhd.io');

    // Press enter to add email domain
    await page.keyboard.press('Enter');

    // Input email domain with invalid format
    await expect(page).toFill(emailDomainInputFieldSelector, 'abc');

    // Press space to add email domain
    await page.keyboard.press('Space');
    await expect(page).toMatchElement(errorMessageSelector, {
      text: 'Invalid domain format.',
    });

    // Input public email domain (e.g., 'gmail.com', 'yahoo.com' etc)
    await expect(page).toFill(emailDomainInputFieldSelector, 'gmail.com');

    // Press tab to add email domain
    await page.keyboard.press('Tab');
    await expect(page).toMatchElement(errorMessageSelector, {
      text: 'Public email domains are not allowed. Invalid domain format.',
    });

    // Remove last added email domain (which is `gmail.com` in this case). CSS selector can not specify the text content of the component.
    await expect(page).toClick(
      [
        'form',
        `${dcls('input')}${cls('multiple')}[role=button]`,
        `${dcls('info')}${cls('tag')}:last-of-type`,
        'button',
      ].join(' ')
    );

    // Error message got updated, since forbidden email domain is removed.
    await expect(page).toMatchElement(errorMessageSelector, {
      text: 'Invalid domain format.',
    });
    await expect(page).toFill(emailDomainInputFieldSelector, 'abc');

    // Input field blurred to input email domain.
    await page.$eval(
      // Can not use `emailDomainInputFieldSelector` here since it could break the type inference.
      'form div[class*=input][class*=multiple][role=button] input',
      (element: HTMLInputElement) => {
        element.blur();
      }
    );

    // Does not allow duplicate email domain.
    await expect(page).toMatchElement(errorMessageSelector, {
      text: 'There are duplicate domains. Invalid domain format.',
    });

    // Remove last two added email domains (which are two `abc` in this case).
    await expect(page).toClick(
      [
        'form',
        `${dcls('input')}${cls('multiple')}[role=button]`,
        `${dcls('info')}${cls('tag')}:last-of-type`,
        'button',
      ].join(' ')
    );

    // Focus on email domain input field component (at this time, the input field is empty).
    const inputField = await page.$(emailDomainInputFieldSelector);
    await inputField?.focus();
    // Should remove the last input email domain with double backspace when the input box is empty.
    await inputField?.press('Backspace');
    await inputField?.press('Backspace');

    // Since incorrect email domains are removed, error message no longer exists.
    const errorMessage = await page.$(errorMessageSelector);
    expect(errorMessage).toBeNull();

    await expectToSaveChanges(page);
    await waitForToast(page, { text: 'Saved' });

    // Inline notification alert should be removed after email domain has been configured.
    const inlineNotification = await page.$(
      ['form', `${dcls('alert')}${cls('inlineNotification')}`, dcls('content')].join(' ')
    );
    expect(inlineNotification).toBeNull();
  });

  it("can configure SSO connectors's 'SSO Experience' GENERAL setup: connector name input field", async () => {
    // Current SSO connector's `connectorName` is `${ssoConnectorTestCases[1].connectorName} (1)`
    const { connectorName } = ssoConnectorTestCases[1]!;
    await expect(page).toFill(connectorNameInputFieldSelector, connectorName);

    await expectToSaveChanges(page);
    await expect(page).toMatchElement(errorMessageSelector, {
      text: 'Connector name already exists. Please choose a different name.',
    });

    await expect(page).toFill(connectorNameInputFieldSelector, `${connectorName} (2)`);
    await expectToSaveChanges(page);
    await waitForToast(page, { text: 'Saved' });
  });

  it("can configure SSO connectors's 'SSO Experience' DISPLAY setup", async () => {
    // Can successfully configure the `displayName`, `logo` and `darkLogo` fields.
    const dataToFill = {
      'branding.displayName': 'Display name',
      'branding.logo': 'https://logto.io/logo.png',
      'branding.darkLogo': 'https://logto.io/logo-dark.png',
    };
    await expect(page).toFillForm('form', dataToFill);
    await expectToSaveChanges(page);
    await waitForToast(page, { text: 'Saved' });
    await Promise.all(
      Object.entries(dataToFill).map(async ([fieldName, value]) => {
        const valueInField = await page.$eval(
          `form div[class$=field] input[type=text][name="${fieldName}"]`,
          (element) => (element instanceof HTMLInputElement ? element.value : null)
        );
        expect(valueInField).toBe(value);
      })
    );

    // Can successfully clear configure in `displayName`, `logo` and `darkLogo` fields.
    const dataToClearForm = {
      'branding.displayName': '',
      'branding.logo': '',
      'branding.darkLogo': '',
    };
    await expect(page).toFillForm('form', dataToClearForm);
    await expectToSaveChanges(page);
    await waitForToast(page, { text: 'Saved' });
    await Promise.all(
      Object.entries(dataToClearForm).map(async ([fieldName, value]) => {
        const valueInField = await page.$eval(
          `form div[class$=field] input[type=text][name="${fieldName}"]`,
          (element) => (element instanceof HTMLInputElement ? element.value : null)
        );
        expect(valueInField).toBe(value);
      })
    );
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
