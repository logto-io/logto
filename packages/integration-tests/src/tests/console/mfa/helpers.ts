import { type Page } from 'puppeteer';

export const expectToClickFactor = async (page: Page, inputName: string) => {
  await expect(page).toClick(`form label[class$=switch]:has(input[name="${inputName}"])`);
};

export const expectToClickPolicyOption = async (page: Page, value: string) => {
  await expect(page).toClick(`form div[role=radio]:has(input[name=policy][value=${value}])`);
};

export const expectBackupCodeSetupError = async (page: Page) => {
  await expect(page).toMatchElement('form div[class*=inlineNotification] div[class$=content]', {
    text: 'To use Backup code for MFA, other factors must be turned on to ensure your users successful sign-in.',
  });
};
