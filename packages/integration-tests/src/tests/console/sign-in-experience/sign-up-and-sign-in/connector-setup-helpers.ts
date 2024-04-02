import { ConnectorType } from '@logto/schemas';
import { type Page } from 'puppeteer';

import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import { expectToClickDetailsPageOption, waitForToast } from '#src/ui-helpers/index.js';
import { expectNavigation, appendPathname, cls } from '#src/utils.js';

import {
  expectToConfirmConnectorDeletion,
  expectToSelectConnector,
  waitForConnectorCreationGuide,
} from '../../connectors/helpers.js';

const logtoConsoleUrl = new URL(logtoConsoleUrlString);

type TestConnector = {
  factoryId: string;
  name: string;
  connectorType: ConnectorType;
  data: Record<string, string>;
};

export const testSendgridConnector: TestConnector = {
  factoryId: 'sendgrid-email-service',
  name: 'SendGrid Email',
  connectorType: ConnectorType.Email,
  data: {
    'formConfig.apiKey': 'api-key',
    'formConfig.fromEmail': 'foo@example.com',
    'formConfig.fromName': 'Logto',
  },
};

export const testTwilioConnector: TestConnector = {
  factoryId: 'twilio-short-message-service',
  name: 'Twilio SMS Service',
  connectorType: ConnectorType.Sms,
  data: {
    'formConfig.accountSID': 'account-sid',
    'formConfig.authToken': 'auth-token',
    'formConfig.fromMessagingServiceSID': 'from-messaging-service-sid',
  },
};

export const testAppleConnector: TestConnector = {
  factoryId: 'apple-universal',
  name: 'Apple',
  connectorType: ConnectorType.Social,
  data: {
    'formConfig.clientId': 'client-id',
  },
};

export const expectToSetupPasswordlessConnector = async (
  page: Page,
  { factoryId, name, connectorType, data }: TestConnector
) => {
  if (connectorType === ConnectorType.Social) {
    return;
  }

  await expectNavigation(
    page.goto(appendPathname('/console/connectors/passwordless', logtoConsoleUrl).href)
  );

  const connectorItem = await expect(page).toMatchElement(
    'div[class$=item] div[class$=previewTitle]:has(>div)',
    {
      text: connectorType === ConnectorType.Email ? 'Email connector' : 'SMS connector',
    }
  );

  const setupConnectorButton = await expect(connectorItem).toMatchElement('button span', {
    text: 'Set up',
  });

  await setupConnectorButton.click();

  await setupConnectorButton.click();

  await expectToSelectConnector(page, {
    factoryId,
    connectorType,
  });

  await waitForConnectorCreationGuide(page, name);
  await expect(page).toFillForm('.ReactModalPortal form', data);

  await expect(page).toClick('.ReactModalPortal form div[class$=footer] button[type=submit] span', {
    text: 'Save and Done',
  });

  await waitForToast(page, { text: 'Saved' });
};

export const expectToSetupSocialConnector = async (
  page: Page,
  { factoryId, name, connectorType, data }: TestConnector
) => {
  if (connectorType !== ConnectorType.Social) {
    return;
  }

  await expectNavigation(
    page.goto(appendPathname('/console/connectors/social', logtoConsoleUrl).href)
  );

  await expect(page).toClick('div[class$=headline] button[class$=withIcon] span', {
    text: 'Add Social Connector',
  });

  await expectToSelectConnector(page, {
    factoryId,
    connectorType,
  });

  await waitForConnectorCreationGuide(page, name);
  await expect(page).toFillForm('.ReactModalPortal form', data);

  await expect(page).toClick('.ReactModalPortal form div[class$=footer] button[type=submit] span', {
    text: 'Save and Done',
  });

  await waitForToast(page, { text: 'Saved' });
};

export const expectToDeletePasswordlessConnector = async (page: Page, { name }: TestConnector) => {
  await expectNavigation(
    page.goto(appendPathname('/console/connectors/passwordless', logtoConsoleUrl).href)
  );

  await expect(page).toClick(`table tbody tr td div[class$=item] a${cls('title')} span`, {
    text: name,
  });

  await expect(page).toMatchElement('div[class$=header] div[class$=name] span', {
    text: name,
  });

  await expectToClickDetailsPageOption(page, 'Delete');

  await expectToConfirmConnectorDeletion(
    page,
    new URL('/console/connectors/passwordless', logtoConsoleUrl).href
  );
};

export const expectToDeleteSocialConnector = async (page: Page, { name }: TestConnector) => {
  await expectNavigation(
    page.goto(appendPathname('/console/connectors/social', logtoConsoleUrl).href)
  );

  await expect(page).toClick(`table tbody tr td div[class$=item] a${cls('title')} span`, {
    text: name,
  });

  await expect(page).toMatchElement('div[class$=header] div[class$=name] span', {
    text: name,
  });

  await expectToClickDetailsPageOption(page, 'Delete');

  await expectToConfirmConnectorDeletion(
    page,
    new URL('/console/connectors/social', logtoConsoleUrl).href
  );
};
