import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import {
  expectConfirmModalAndAct,
  expectMainPageWithTitle,
  expectModalWithTitle,
  expectToClickDetailsPageOption,
  expectToClickModalAction,
  expectToSaveChanges,
  goToAdminConsole,
  waitForToast,
} from '#src/ui-helpers/index.js';
import { appendPathname, dcls, expectNavigation } from '#src/utils.js';

import { expectToCreateWebhook } from './helpers.js';

await page.setViewport({ width: 1280, height: 720 });

describe('webhooks', () => {
  const logtoConsoleUrl = new URL(logtoConsoleUrlString);

  beforeAll(async () => {
    await goToAdminConsole();
  });

  it('navigates to webhooks page on clicking sidebar menu', async () => {
    await expectNavigation(page.goto(appendPathname('/console/webhooks', logtoConsoleUrl).href));

    await expectMainPageWithTitle(page, 'Webhooks');
  });

  it('can create a new webhook', async () => {
    await page.goto(appendPathname('/console/webhooks', logtoConsoleUrl).href);

    await expectToCreateWebhook(page);

    // Go to webhook details page
    await expect(page).toMatchElement('div[class$=main] div[class$=metadata] div[class$=name]', {
      text: 'hook_name',
    });

    const hookId = await page.$eval(
      'div[class$=main] div[class$=metadata] div[class$=row] div[class$=content]',
      (element) => element.textContent
    );
    if (hookId) {
      expect(page.url()).toBe(new URL(`console/webhooks/${hookId}/settings`, logtoConsoleUrl).href);
    }
  });

  it('fails to create webhook if no event is provided', async () => {
    await expectNavigation(page.goto(appendPathname('/console/webhooks', logtoConsoleUrl).href));

    await expect(page).toClick('div[class$=main] div[class$=headline] > button');
    await expect(page).toFill('input[name=name]', 'hook_name');
    await expect(page).toFill('input[name=url]', 'https://localhost/webhook');
    await expect(page).toClick('button[type=submit]');
    await expect(page).toMatchElement('.ReactModalPortal div[class$=errorMessage]', {
      text: 'You have to select at least one event.',
    });
  });

  it('can create webhook if endpoint url is an HTTP url', async () => {
    await expectNavigation(page.goto(appendPathname('/console/webhooks', logtoConsoleUrl).href));

    await expect(page).toClick('div[class$=main] div[class$=headline] > button');
    await expect(page).toClick('span[class$=label]', { text: 'PostRegister' });
    await expect(page).toClick('span[class$=label]', { text: 'User.Create' });
    await expect(page).toFill('input[name=name]', 'hook_name');
    await expect(page).toFill('input[name=url]', 'http://localhost/webhook');
    await expect(page).toClick('button[type=submit]');
    await expect(page).toMatchElement('div[class$=main] div[class$=metadata] div[class$=name]', {
      text: 'hook_name',
    });
  });

  it('can update webhook details', async () => {
    await page.goto(appendPathname('/console/webhooks', logtoConsoleUrl).href);

    await expectToCreateWebhook(page);

    await expect(page).toFill('input[name=name]', 'hook_name_updated');
    await expect(page).toFill('input[name=url]', 'https://localhost/new-webhook');

    await expectToSaveChanges(page);
    await waitForToast(page, { text: 'Saved' });
  });

  it('can disable or enable a webhook', async () => {
    await page.goto(appendPathname('/console/webhooks', logtoConsoleUrl).href);
    await expectToCreateWebhook(page);

    // Disable webhook
    await expectToClickDetailsPageOption(page, 'Disable webhook');
    await expectModalWithTitle(page, 'Reminder');
    await expect(page).toMatchElement('.ReactModalPortal div[class$=content] div[class$=content]', {
      text: 'Are you sure you want to reactivate this webhook? Doing so will not send HTTP request to endpoint URL.',
    });
    await expectToClickModalAction(page, 'Disable webhook');

    await expect(page).toMatchElement([dcls('header'), dcls('metadata'), dcls('tag')].join(' '), {
      text: 'Not in use',
      timeout: 3000,
    });

    // Reactivate webhook
    await expectToClickDetailsPageOption(page, 'Reactivate webhook');

    // Wait for the active webhook state info to appear
    await page.waitForSelector(
      'div[class$=header] div[class$=metadata] > div[class$=row] > div[class$=text]'
    );
  });

  it('can regenerate signing key for a webhook', async () => {
    await page.goto(appendPathname('/console/webhooks', logtoConsoleUrl).href);
    await expectToCreateWebhook(page);
    await expect(page).toClick('button[class$=regenerateButton]');

    await expectConfirmModalAndAct(page, {
      title: 'Regenerate signing key',
      actionText: 'Regenerate',
    });

    await waitForToast(page, { text: 'Signing key has been regenerated.' });
  });

  it('should display an error info if test failed', async () => {
    await expect(page).toClick('div[class$=field] button span', { text: 'Send test payload' });
    await expect(page).toMatchElement('div[class*=inlineNotification] div[class$=content] div', {
      text: /Endpoint URL:/,
      timeout: 3000,
    });

    await expect(page).toClick('div[class*=inlineNotification] button span', { text: 'Got it' });
    await page.waitForSelector('div[class*=inlineNotification]', { hidden: true });
  });
});
