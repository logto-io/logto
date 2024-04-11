import { ConnectorType } from '@logto/connector-kit';
import { SignInMode, SignInIdentifier, type PartialPasswordPolicy } from '@logto/schemas';
import { type ElementHandle, type Browser, type Page } from 'puppeteer';

import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import {
  consolePassword,
  consoleUsername,
  logtoConsoleUrl as logtoConsoleUrlString,
} from '#src/constants.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import { dcls, expectNavigation, waitFor } from '#src/utils.js';

import { selectDropdownMenuItem } from './select-dropdown-menu-item.js';

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
    { text, timeout: 5000 }
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

  await expectToClickModalAction(page, 'Stay on page');
};

export const expectToSaveChanges = async (page: Page) => {
  // Wait for the action bar to finish animating
  await waitFor(500);
  await expect(page).toClick('div[class$=actionBar] button span', { text: 'Save changes' });
};

export const expectToDiscardChanges = async (page: Page) => {
  // Wait for the action bar to finish animating
  await waitFor(500);
  await expect(page).toClick('div[class$=actionBar] button span', { text: 'Discard' });
};

export const expectToClickDetailsPageOption = async (page: Page, optionText: string) => {
  await expect(page).toClick('div[class$=header] div[class$=operations] div button span:has(svg)');

  await expect(page).toMatchElement(
    '.ReactModalPortal div[class$=dropdownContainer] div[class$=dropdownTitle]',
    {
      text: 'MORE OPTIONS',
    }
  );

  await selectDropdownMenuItem(page, 'div[role=menuitem]', optionText);

  await page.waitForSelector(
    '.ReactModalPortal div[class$=dropdownContainer] div[class$=dropdownTitle]',
    {
      hidden: true,
    }
  );
};

export const expectModalWithTitle = async (page: Page, title: string | RegExp) => {
  await expect(page).toMatchElement(
    ['.ReactModalPortal', dcls('header'), dcls('title')].join(' '),
    {
      text: title,
    }
  );
};

export const expectToClickModalAction = async (page: Page, actionText: string | RegExp) => {
  await expect(page).toClick('.ReactModalPortal div[class$=footer] button span', {
    text: actionText,
  });
};

type ExpectConfirmModalAndActOptions = {
  title: string | RegExp;
  actionText: string | RegExp;
};

export const expectConfirmModalAndAct = async (
  page: Page,
  { title, actionText }: ExpectConfirmModalAndActOptions
) => {
  await expectModalWithTitle(page, title);
  await expectToClickModalAction(page, actionText);
};

export const expectToClickNavTab = async (page: Page, tab: string) => {
  await expect(page).toClick('nav div[class$=item] div[class*=link] a', {
    text: tab,
  });
};

export const expectToOpenNewPage = async (browser: Browser, url: string) => {
  const target = await browser.waitForTarget((target) => target.url() === url);

  const newPage = await target.page();
  expect(newPage).toBeTruthy();

  await newPage?.close();
};

export const expectMainPageWithTitle = async (page: Page, title: string) => {
  await expect(page).toMatchElement('div[class$=main] div[class$=titleEllipsis]', {
    text: title,
    timeout: 2000,
  });
};

export const expectToClickSidebarMenu = async (page: Page, menuText: string) => {
  await expect(page).toClick('div[class$=sidebar] a div[class$=title]', {
    text: menuText,
  });
};

export const getInputValue = async (input: ElementHandle<HTMLInputElement>) => {
  return input.evaluate((element) => element.value);
};

/**
 * Setup the email connector and update the sign-in experience to the following:
 *
 * - Sign-in and register mode
 * - Use username and password to sign-up
 * - Use username or email to sign-in
 * - Email sign-in can use verification code
 *
 * @param passwordPolicy The password policy to partially update the existing one.
 */
export const setupUsernameAndEmailExperience = async (passwordPolicy?: PartialPasswordPolicy) => {
  await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
  await setEmailConnector();
  await updateSignInExperience({
    termsOfUseUrl: '',
    privacyPolicyUrl: '',
    signInMode: SignInMode.SignInAndRegister,
    signUp: {
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    },
    signIn: {
      methods: [
        {
          identifier: SignInIdentifier.Username,
          password: true,
          verificationCode: false,
          isPasswordPrimary: true,
        },
        {
          identifier: SignInIdentifier.Email,
          password: true,
          verificationCode: true,
          isPasswordPrimary: true,
        },
      ],
    },
    passwordPolicy,
  });
};
