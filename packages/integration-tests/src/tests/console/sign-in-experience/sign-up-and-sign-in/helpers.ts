import { type Page } from 'puppeteer';

import { selectDropdownMenuItem } from '#src/ui-helpers/select-dropdown-menu-item.js';
import { waitFor } from '#src/utils.js';

import { expectToSaveSignInExperience } from '../helpers.js';

export const expectToSelectSignUpIdentifier = async (page: Page, identifier: string) => {
  const signUpIdentifierField = await expect(page).toMatchElement(
    'div[class$=field]:has(div[class$=headline] > div[class$=title])',
    {
      text: 'Sign-up identifier',
    }
  );

  await expect(signUpIdentifierField).toClick('div[role=button][class*=select]');

  // Wait for the dropdown to be rendered in the correct position
  await selectDropdownMenuItem(page, 'div[role=menuitem] div', identifier);

  await page.waitForSelector('.ReactModalPortal div[class$=dropdownContainer]', {
    hidden: true,
  });

  await expect(signUpIdentifierField).toMatchElement('div[class*=select] div[class$=title] div', {
    text: identifier,
  });

  // Wait for the config to update
  await waitFor(100);
};

export const expectToClickSignUpAuthnOption = async (page: Page, option: string) => {
  const signUpAuthnSettingsFiled = await expect(page).toMatchElement(
    'div[class$=field]:has(div[class$=headline] > div[class$=title])',
    {
      text: 'Authentication setting for sign-up',
    }
  );

  await expect(signUpAuthnSettingsFiled).toClick('div[class$=selections] span[class$=label]', {
    text: option,
  });
};

export const expectToAddSignInMethod = async (page: Page, method: string, isAddAnother = true) => {
  const signInMethodsField = await expect(page).toMatchElement(
    'div[class$=field]:has(div[class$=headline] > div[class$=title])',
    {
      text: 'Identifier and authentication settings for sign-in',
    }
  );

  // Click Add another
  await expect(signInMethodsField).toClick('button span', {
    text: isAddAnother ? 'Add another' : 'Add sign-in method',
  });

  // Wait for the dropdown to be rendered in the correct position
  await waitFor(100);

  await expect(page).toClick('.ReactModalPortal div[class$=dropdownContainer] div[role=menuitem]', {
    text: method,
  });

  await page.waitForSelector('.ReactModalPortal div[class$=dropdownContainer]', {
    hidden: true,
  });
};

type ExpectSignInMethodAuthnOptionOptions = {
  method: string;
  option: string;
};

export const expectToClickSignInMethodAuthnOption = async (
  page: Page,
  { method, option }: ExpectSignInMethodAuthnOptionOptions
) => {
  const methodItem = await expect(page).toMatchElement(
    'div[class$=signInMethodItem]:has(div[class$=identifier])',
    {
      text: method,
    }
  );

  await expect(methodItem).toClick('div[class*=authentication] span[class$=label]', {
    text: option,
  });

  // Wait for the config to update
  await waitFor(100);
};

export const expectToSwapSignInMethodAuthnOption = async (page: Page, method: string) => {
  const methodItem = await expect(page).toMatchElement(
    'div[class$=signInMethodItem]:has(div[class$=identifier])',
    {
      text: method,
    }
  );

  await expect(methodItem).toClick('div[class*=authentication] div[class$=swapButton] button');
};

export const expectToRemoveSignInMethod = async (page: Page, method: string) => {
  const methodItem = await expect(page).toMatchElement(
    'div[class$=signInMethodItem]:has(div[class$=identifier])',
    {
      text: method,
    }
  );

  await expect(methodItem).toClick('div[class$=anchor] button:last-of-type');

  // Wait for the config to update
  await waitFor(100);
};

export const expectSignInMethodError = async (page: Page, method: string) => {
  await expect(page).toMatchElement(
    'div[class$=signInMethodItem] div[class$=error] div[class$=identifier]',
    {
      text: method,
    }
  );
};

type ExpectNotificationOnFiledOptions = {
  field: string;
  content?: RegExp | string;
};

export const expectNotificationInFiled = async (
  page: Page,
  { field, content }: ExpectNotificationOnFiledOptions
) => {
  const signInMethodsField = await expect(page).toMatchElement(
    'div[class$=field]:has(div[class$=headline] > div[class$=title])',
    {
      text: field,
    }
  );

  await expect(signInMethodsField).toMatchElement(
    'div[class*=inlineNotification] div[class$=content]',
    {
      text: content,
    }
  );
};

export const expectSignUpIdentifierSelectorError = async (page: Page) => {
  const signUpIdentifierField = await expect(page).toMatchElement(
    'div[class$=field]:has(div[class$=headline] > div[class$=title])',
    {
      text: 'Sign-up identifier',
    }
  );

  await expect(signUpIdentifierField).toMatchElement('div[class*=select][class*=error]');
};

export const expectToResetSignUpAndSignInConfig = async (page: Page, needSave = true) => {
  // Select 'Email address or phone number' first to ensure the sign-in method contains phone and email
  await expectToSelectSignUpIdentifier(page, 'Email address or phone number');
  await expectToSelectSignUpIdentifier(page, 'Username');
  await expectToRemoveSignInMethod(page, 'Email address');
  await expectToRemoveSignInMethod(page, 'Phone number');
  if (needSave) {
    await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
  }
};

export const expectToAddSocialSignInConnector = async (page: Page, name: string) => {
  const socialSignInField = await expect(page).toMatchElement(
    'div[class$=field]:has(div[class$=headline] > div[class$=title])',
    {
      text: 'Social sign-in',
    }
  );

  await expect(socialSignInField).toClick('button span', {
    text: 'Add Social Connector',
  });

  await selectDropdownMenuItem(page, 'div[role=menuitem] span[class$=name]', name);

  await page.waitForSelector('.ReactModalPortal div[class$=dropdownContainer]', {
    hidden: true,
  });
};

export const expectToRemoveSocialSignInConnector = async (page: Page, name: string) => {
  const socialSignInField = await expect(page).toMatchElement(
    'div[class$=field]:has(div[class$=headline] > div[class$=title])',
    {
      text: 'Social sign-in',
    }
  );

  const connectorItem = await expect(socialSignInField).toMatchElement(
    'div[class$=item]:has(span[class$=name])',
    {
      text: name,
    }
  );

  await expect(connectorItem).toClick('button:last-of-type');
};

type ExpectErrorsOnNavTabOptions = {
  tab: string;
  error?: RegExp | string;
};

export const expectErrorsOnNavTab = async (
  page: Page,
  { tab, error }: ExpectErrorsOnNavTabOptions
) => {
  const signUpAndSignInTab = await expect(page).toMatchElement('nav div[class$=item]:has(a)', {
    text: tab,
  });

  await expect(signUpAndSignInTab).toMatchElement('div[class$=errors]', {
    text: error,
  });
};
