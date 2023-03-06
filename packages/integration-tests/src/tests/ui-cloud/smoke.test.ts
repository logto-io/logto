import path from 'path';

import { logtoCloudUrl as logtoCloudUrlString, logtoConsoleUrl } from '#src/constants.js';
import { generatePassword } from '#src/utils.js';

const appendPathname = (pathname: string, baseUrl: URL) =>
  new URL(path.join(baseUrl.pathname, pathname), baseUrl);

/**
 * NOTE: This test suite assumes test cases will run sequentially (which is Jest default).
 * Parallel execution will lead to errors.
 */
describe('smoke testing for cloud', () => {
  const consoleUsername = 'admin';
  const consolePassword = generatePassword();
  const logtoCloudUrl = new URL(logtoCloudUrlString);
  const adminTenantUrl = new URL(logtoConsoleUrl); // In dev mode, the console URL is actually for admin tenant

  it('opens with app element and navigates to sign-in page', async () => {
    const navigation = page.waitForNavigation({ waitUntil: 'networkidle0' });
    await page.goto(logtoCloudUrl.href);
    await navigation;

    await expect(page.waitForSelector('#app')).resolves.not.toBeNull();
    expect(page.url()).toBe(appendPathname('/register', adminTenantUrl).href);
  });

  it('registers the first admin account', async () => {
    const createAccountButton = await page.waitForSelector('button');
    expect(createAccountButton).not.toBeNull();

    const usernameField = await page.waitForSelector('input[name=identifier]');
    const submitButton = await page.waitForSelector('button[name=submit]');

    await usernameField.type(consoleUsername);

    const navigateToCreatePassword = page.waitForNavigation({ waitUntil: 'networkidle0' });
    await submitButton.click();
    await navigateToCreatePassword;

    expect(page.url()).toBe(appendPathname('/register/password', adminTenantUrl).href);

    const passwordField = await page.waitForSelector('input[name=newPassword]');
    const confirmPasswordField = await page.waitForSelector('input[name=confirmPassword]');
    const saveButton = await page.waitForSelector('button[name=submit]');
    await passwordField.type(consolePassword);
    await confirmPasswordField.type(consolePassword);

    const navigateToCloud = page.waitForNavigation({ waitUntil: 'networkidle0' });
    await saveButton.click();
    await navigateToCloud;

    expect(page.url()).toBe(logtoCloudUrl.href);
  });

  it('shows a tenant-select page with two tenants', async () => {
    const tenantsWrapper = await page.waitForSelector('div[class$=wrapper]');
    const tenants = await tenantsWrapper.$$('a');
    const hrefs = await Promise.all(
      tenants.map(async (element) => {
        const value = await element.getProperty('href');

        return value.jsonValue();
      })
    );

    expect(
      ['default', 'admin'].every((tenantId) =>
        hrefs.some((href) => String(href).endsWith('/' + tenantId))
      )
    );
  });
});
