import { conditionalString } from '@silverhand/essentials';
import { type Page } from 'puppeteer';

import { type SsoConnectorTestCase } from './sso-connectors-test-cases.js';

export const findModalFooterButton = async (isButtonDisabled = false) => {
  return page.waitForSelector(
    `.ReactModalPortal div[class$=footer] button${conditionalString(
      isButtonDisabled && '[disabled]'
    )}`
  );
};

export const fillSsoConnectorCreationModal = async (
  page: Page,
  { connectorFactoryName, connectorName }: SsoConnectorTestCase
) => {
  // Button should be disabled util form is filled.
  await expect(findModalFooterButton(true)).resolves.toBeTruthy();

  // Select connector factory
  await expect(page).toClick(
    `.ReactModalPortal div[role=radio] div[class$=ssoConnector] div[class$=content] div[class$=name] span`,
    { text: connectorFactoryName }
  );

  // Button should be disabled util form is filled.
  await expect(findModalFooterButton(true)).resolves.toBeTruthy();

  await expect(page).toFill(
    '.ReactModalPortal input[type=text][name=connectorName]',
    connectorName
  );

  // Button should enabled.
  const createButton = await findModalFooterButton();
  await createButton?.click();
};
