import { logtoCloudUrl, logtoConsoleUrl } from '#src/constants.js';
import { generatePassword } from '#src/utils.js';

/**
 * NOTE: This test suite assumes test cases will run sequentially (which is Jest default).
 * Parallel execution will lead to errors.
 */
describe('smoke testing for cloud', () => {
  const consoleUsername = 'admin';
  const consolePassword = generatePassword();
  const adminTenantUrl = logtoConsoleUrl; // In dev mode, the console URL is actually for admin tenant

  it('opens with app element and navigates to sign-in page', async () => {
    const navigation = page.waitForNavigation({ waitUntil: 'networkidle0' });
    await page.goto(logtoCloudUrl);
    await navigation;

    await expect(page.waitForSelector('#app')).resolves.not.toBeNull();
    expect(page.url()).toBe(new URL('sign-in', adminTenantUrl).href);
  });
});
