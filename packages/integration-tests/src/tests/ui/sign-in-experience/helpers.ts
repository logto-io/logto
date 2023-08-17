import { type Page } from 'puppeteer';

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
