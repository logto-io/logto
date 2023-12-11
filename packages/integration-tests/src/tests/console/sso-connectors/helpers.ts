import { conditionalString } from '@silverhand/essentials';
import { type Page } from 'puppeteer';

import { dcls, cls } from '#src/utils.js';

import { type SsoConnectorTestCase, type Protocol } from './sso-connectors-test-cases.js';

const getAndCheckValueByFieldName = async (page: Page, fieldName: string, expectSuffix: string) => {
  const valueField = await expect(page).toMatchElement(
    [dcls('form'), `${dcls('field')}:has(${dcls('headline')} > ${dcls('title')})`].join(' '),
    { text: fieldName }
  );
  const value = await valueField.$eval(
    [dcls('copyToClipboard'), dcls('row'), dcls('content')].join(' '),
    (element) => element.textContent
  );

  expect(value?.endsWith(expectSuffix)).toBeTruthy();
};

// Check the correctness of automatically generated connection info on the `Connection` tab.
const checkSsoConnectorConnectionTabInfo = async (page: Page, protocol: Protocol) => {
  // Wait for the details page redirect to default tab (which is `Connection` tab).
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  // eslint-disable-next-line prefer-regex-literals
  const regExpForDetailsPageUrl = new RegExp('enterprise-sso\\/([^/]+)\\/connection');

  expect(regExpForDetailsPageUrl.test(page.url())).toBe(true);
  const ssoConnectorIdFromUrl = regExpForDetailsPageUrl.exec(page.url())?.[1];

  if (!ssoConnectorIdFromUrl) {
    throw new Error('SSO connector ID is not found in URL.');
  }

  // The SSO connector ID shown on the page should match the ID of the SSO connector in URL.
  await expect(page).toMatchElement(
    [
      dcls('metadata'),
      dcls('row'),
      `${dcls('container')}${cls('copyId')}`,
      dcls('row'),
      dcls('content'),
    ].join(' '),
    { text: ssoConnectorIdFromUrl }
  );

  if (protocol === 'SAML') {
    await getAndCheckValueByFieldName(
      page,
      'Assertion consumer service URL (Reply URL)',
      `api/authn/single-sign-on/saml/${ssoConnectorIdFromUrl}`
    );

    await getAndCheckValueByFieldName(
      page,
      'Audience URI (SP Entity ID)',
      `enterprise-sso/${ssoConnectorIdFromUrl}`
    );
  }

  if (protocol === 'OIDC') {
    await getAndCheckValueByFieldName(
      page,
      'Redirect URI (Callback URL)',
      `callback/${ssoConnectorIdFromUrl}`
    );
  }
};

export const findModalFooterButton = async (isButtonDisabled = false) => {
  return page.waitForSelector(
    `.ReactModalPortal div[class$=footer] button${conditionalString(
      isButtonDisabled && '[disabled]'
    )}`
  );
};

export const fillSsoConnectorCreationModal = async (
  page: Page,
  { connectorFactoryName, connectorName, protocol }: SsoConnectorTestCase,
  checkConnectionInfo = false
) => {
  // Button should be disabled util form is filled.
  await expect(findModalFooterButton(true)).resolves.toBeTruthy();

  // Select connector factory
  await expect(page).toClick(
    [
      '.ReactModalPortal',
      'div[role=radio]',
      dcls('ssoConnector'),
      dcls('content'),
      dcls('name'),
      'span',
    ].join(' '),
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

  if (checkConnectionInfo) {
    // Wait for the page redirect to details page.
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    await checkSsoConnectorConnectionTabInfo(page, protocol);
  }
};
