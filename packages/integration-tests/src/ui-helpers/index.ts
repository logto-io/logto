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

type WaitToasterOptions = {
  text?: string | RegExp;
  type?: 'success' | 'error';
};

export const waitForToast = async (page: Page, { text, type = 'success' }: WaitToasterOptions) => {
  const toast = await expect(page).toMatchElement(
    `div[class*=toast][class*=${type}]:has(div[class$=message])`,
    { text }
  );

  // Remove immediately to prevent waiting for the toast to disappear and matching the same toast again
  await toast.evaluate((element) => {
    element.remove();
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

export const expectToSaveChanges = async (page: Page) => {
  // Wait for the action bar to finish animating
  await page.waitForTimeout(500);
  await expect(page).toClick('div[class$=actionBar] button span', { text: 'Save Changes' });
};

export const expectToDiscardChanges = async (page: Page) => {
  // Wait for the action bar to finish animating
  await page.waitForTimeout(500);
  await expect(page).toClick('div[class$=actionBar] button span', { text: 'Discard' });
};

export const expectToClickDetailsPageOption = async (page: Page, optionText: string) => {
  await expect(page).toClick(
    'div[class$=header] button[class$=withIcon]:last-of-type span[class$=icon]:has(svg)'
  );

  await expect(page).toMatchElement(
    '.ReactModalPortal div[class$=dropdownContainer] div[class$=dropdownTitle]',
    {
      text: 'MORE OPTIONS',
    }
  );

  // Wait for the dropdown menu to be rendered in the correct position
  await page.waitForTimeout(500);

  await expect(page).toClick('.ReactModalPortal div[class$=dropdownContainer] div[role=menuitem]', {
    text: optionText,
  });

  await page.waitForSelector(
    '.ReactModalPortal div[class$=dropdownContainer] div[class$=dropdownTitle]',
    {
      hidden: true,
    }
  );
};

type ExpectConfirmModalAndActOptions = {
  title?: string | RegExp;
  actionText?: string | RegExp;
};

export const expectConfirmModalAndAct = async (
  page: Page,
  { title, actionText }: ExpectConfirmModalAndActOptions
) => {
  await expect(page).toMatchElement(
    '.ReactModalPortal div[class$=header] div[class$=titleEllipsis]',
    {
      text: title,
    }
  );

  if (actionText) {
    await expect(page).toClick('.ReactModalPortal div[class$=footer] button span', {
      text: actionText,
    });
  }
};

export const expectToClickNavTab = async (page: Page, tab: string) => {
  await expect(page).toClick('nav div[class$=item] div[class$=link] a', {
    text: tab,
  });
};
