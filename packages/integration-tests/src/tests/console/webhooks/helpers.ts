import { type Page } from 'puppeteer';

export const expectToCreateWebhook = async (page: Page) => {
  await expect(page).toClick('div[class$=main] div[class$=headline] > button');
  await expect(page).toClick('span[class$=label]', { text: 'PostRegister' });
  await expect(page).toClick('span[class$=label]', { text: 'User.Data.Updated' });
  await expect(page).toFill('input[name=name]', 'hook_name');
  await expect(page).toFill('input[name=url]', 'https://localhost/webhook');
  await expect(page).toClick('button[type=submit]');
  await page.waitForSelector('div[class$=header] div[class$=metadata] div[class$=name]');
};
