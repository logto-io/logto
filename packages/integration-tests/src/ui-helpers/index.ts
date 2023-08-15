import { type Page } from 'puppeteer';

import {
  consolePassword,
  consoleUsername,
  logtoConsoleUrl as logtoConsoleUrlString,
} from '#src/constants.js';
import { expectNavigation } from '#src/utils.js';

export const goToAdminConsole = async () => {
  const logtoConsoleUrl = new URL(logtoConsoleUrlString);
  await expectNavigation(page.goto(logtoConsoleUrl.href));

  if (page.url() === new URL('sign-in', logtoConsoleUrl).href) {
    await expect(page).toFillForm('form', {
      identifier: consoleUsername,
      password: consolePassword,
    });
    await expectNavigation(expect(page).toClick('button[name=submit]'));
  }
};

export const waitForSuccessToast = async (page: Page, text: string) => {
  const successToastHandle = await page.waitForSelector('div[class*=toast][class*=success]');
  await expect(successToastHandle).toMatchElement('div[class$=message]', {
    text,
  });
  // Wait the success toast to disappear so that the next time we call this function we will match the brand new toast
  await page.waitForSelector('div[class*=toast][class*=success]', {
    hidden: true,
  });
};

export const expectUnsavedChangesAlert = async (page: Page) => {
  // Unsaved changes alert
  await page.goBack();

  await page.waitForSelector(
    '.ReactModalPortal div[class$=content]::-p-text(You have made some changes. Are you sure you want to leave this page?)'
  );

  await expect(page).toClick('.ReactModalPortal div[class$=footer] button', {
    text: 'Stay on Page',
  });
};

export const trySaveChanges = async (page: Page) => {
  // Wait for the action bar to finish animating
  await page.waitForTimeout(500);
  await expect(page).toClick('div[class$=actionBar] button span', { text: 'Save Changes' });
};
