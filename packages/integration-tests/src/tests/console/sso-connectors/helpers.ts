import fs from 'node:fs';

import { conditional, conditionalString } from '@silverhand/essentials';
import { type Page } from 'puppeteer';

import { metadataXml } from '#src/__mocks__/sso-connectors-mock.js';
import { expectToSaveChanges, waitForToast } from '#src/ui-helpers/index.js';
import { dcls, cls } from '#src/utils.js';

import { type SsoConnectorTestCase, type Protocol } from './sso-connectors-test-cases.js';

const getAndCheckValueByFieldName = async (page: Page, fieldName: string, expectSuffix: string) => {
  const valueField = await expect(page).toMatchElement(
    [dcls('form'), `${dcls('field')}:has(${dcls('headline')} > ${dcls('title')})`].join(' '),
    { text: fieldName }
  );
  const value = await valueField.$eval(
    [dcls('container'), dcls('row'), dcls('content')].join(' '),
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

const checkOidcConfigPreview = async (previewResults: Record<string, string>) => {
  await Promise.all(
    Object.entries(previewResults).map(async ([key, value]) => {
      const valueField = await expect(page).toMatchElement(
        [`${dcls('container')}${cls('oidcConfigPreview')}`, `div:has(${dcls('title')})`].join(' '),
        { text: key }
      );
      const valueDisplayed = await valueField.$eval(
        [dcls('content')].join(' '),
        (element) => element.textContent
      );

      expect(valueDisplayed).toBe(value);
    })
  );
};

const checkSamlConfigPreview = async (previewResults: Record<string, string>) => {
  await Promise.all(
    Object.entries(previewResults).map(async ([key, value]) => {
      const valueField = await expect(page).toMatchElement(
        [`${dcls('samlMetadataForm')}`, `${dcls('container')}`, `div:has(${dcls('title')})`].join(
          ' '
        ),
        { text: key }
      );
      const valueDisplayed = await valueField.$eval(
        [
          dcls('content'),
          conditional(key === 'Signing certificate' && dcls('certificatePreview')),
        ].join(' '),
        (element) => element.textContent
      );

      expect(valueDisplayed).toBe(value);
    })
  );
};

// Configure the SSO connector connection and check the validity by comparing the preview results.
const configureSsoConnectorConnection = async (
  page: Page,
  formData: Record<string, string>,
  protocol: Protocol,
  previewResults: Record<string, string>
) => {
  await fillSsoConnectorConnectionForm(page, formData, protocol);

  await expectToSaveChanges(page);
  await waitForToast(page, { text: 'Saved' });

  if (protocol === 'OIDC') {
    await checkOidcConfigPreview(previewResults);
  }

  if (protocol === 'SAML') {
    await checkSamlConfigPreview(previewResults);
  }
};

const fillSsoConnectorConnectionForm = async (
  page: Page,
  formData: Record<string, string>,
  protocol: Protocol
) => {
  if (protocol === 'OIDC') {
    await expect(page).toFillForm(dcls('form'), formData);
    return;
  }

  // Click on the switch config method link
  await expect(page).toClick([dcls('form'), 'button'].join(' '));

  // Click on the "Upload the metadata XML file" option
  const dropdownMenu = await page.waitForSelector(
    ['.ReactModalPortal', dcls('dropdownContainer')].join(' ')
  );

  await page.evaluate((dropdownMenu) => {
    if (dropdownMenu) {
      const optionElement = dropdownMenu.querySelectorAll('div[role=menuitem] div');
      const uploadMetadataXmlOption = Array.from(optionElement).find(
        (element) => element.textContent === 'Upload the metadata XML file'
      );

      if (uploadMetadataXmlOption) {
        const clickEvent = new MouseEvent('click', { bubbles: true });
        uploadMetadataXmlOption.dispatchEvent(clickEvent);
      }
    }
  }, dropdownMenu);

  await uploadMetadataXml(page);
};

export const uploadMetadataXml = async (page: Page) => {
  const fileInputElement = await page.waitForSelector('form input[type=file]');
  expect(fileInputElement).toBeTruthy();

  if (!fileInputElement) {
    throw new Error('File input element is not found.');
  }

  const metadataFilePath = './metadata.xml';
  fs.writeFileSync(metadataFilePath, metadataXml);

  await fileInputElement.uploadFile(metadataFilePath);

  // Delete the mock file
  fs.unlinkSync(metadataFilePath);
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
  { connectorFactoryName, connectorName, protocol, formData, previewResults }: SsoConnectorTestCase,
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

    await configureSsoConnectorConnection(page, formData, protocol, previewResults);
  }
};
