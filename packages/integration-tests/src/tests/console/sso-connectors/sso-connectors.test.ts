import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import {
  goToAdminConsole,
  expectModalWithTitle,
  expectToClickDetailsPageOption,
  expectConfirmModalAndAct,
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
