import { type Page } from 'puppeteer';

import { trySaveChanges, expectConfirmModalAndAct, waitForToaster } from '#src/ui-helpers/index.js';

export const waitForFormCard = async (page: Page, title: string) => {
  await expect(page).toMatchElement('div[class$=tabContent] div[class$=card] div[class$=title]', {
    text: title,
  });
};

type ExpectToSelectColorOptions = {
  field: string;
  color: string;
};

export const expectToSelectColor = async (
  page: Page,
  { field, color }: ExpectToSelectColorOptions
) => {
  const colorField = await expect(page).toMatchElement(
    'div[class$=field]:has(div[class$=headline] div[class$=title])',
    {
      text: field,
    }
  );

  await expect(colorField).toClick('div[role=button]');

  await expect(page).toFill('input[id^=rc-editable-input]', color);

  // Close the color input
  await page.keyboard.press('Escape');
};

type ExpectToSaveSignInExperienceOptions = {
  needToConfirmChanges?: boolean;
};

export const expectToSaveSignInExperience = async (
  page: Page,
  options?: ExpectToSaveSignInExperienceOptions
) => {
  const { needToConfirmChanges = false } = options ?? {};

  await trySaveChanges(page);

  if (needToConfirmChanges) {
    // Confirm changes
    await expectConfirmModalAndAct(page, {
      title: 'Reminder',
      actionText: 'Confirm',
    });
  }

  await waitForToaster(page, {
    text: 'Saved',
  });
};

export const expectToSelectPreviewLanguage = async (page: Page, language: string) => {
  // Click on the language selector
  await expect(page).toClick('div[class$=preview] div[class*=select][class*=language]');

  // Wait for the dropdown menu to render in the correct position
  await page.waitForTimeout(500);

  await expect(page).toClick('.ReactModalPortal div[class$=dropdownContainer] div[role=menuitem]', {
    text: language,
  });

  await page.waitForSelector('.ReactModalPortal div[class$=dropdownContainer]', {
    hidden: true,
  });
};
