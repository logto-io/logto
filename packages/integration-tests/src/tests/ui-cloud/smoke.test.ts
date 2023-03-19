import { appendPath } from '@silverhand/essentials';
import { setDefaultOptions } from 'expect-puppeteer';

import { logtoCloudUrl as logtoCloudUrlString, logtoConsoleUrl } from '#src/constants.js';
import { generatePassword } from '#src/utils.js';

setDefaultOptions({ timeout: 1000 });

/**
 * NOTE: This test suite assumes test cases will run sequentially (which is Jest default).
 * Parallel execution will lead to errors.
 */
// Tip: See https://github.com/argos-ci/jest-puppeteer/blob/main/packages/expect-puppeteer/README.md
// for convenient expect methods
describe('smoke testing for cloud', () => {
  const consoleUsername = 'admin';
  const consolePassword = generatePassword();
  const logtoCloudUrl = new URL(logtoCloudUrlString);
  const adminTenantUrl = new URL(logtoConsoleUrl); // In dev mode, the console URL is actually for admin tenant

  it('can open with app element and navigate to register page', async () => {
    await page.goto(logtoCloudUrl.href);
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    await expect(page.waitForSelector('#app')).resolves.not.toBeNull();
    expect(page.url()).toBe(appendPath(adminTenantUrl, '/register').href);
  });

  it('can register the first admin account', async () => {
    await expect(page).toClick('button', { text: 'Create account' });

    await expect(page).toFill('input[name=identifier]', consoleUsername);
    await expect(page).toClick('button[name=submit]');

    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    expect(page.url()).toBe(appendPath(adminTenantUrl, '/register/password').href);

    await expect(page).toFillForm('form', {
      newPassword: consolePassword,
      confirmPassword: consolePassword,
    });
    await expect(page).toClick('button[name=submit]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    expect(page.url()).toBe(logtoCloudUrl.href);
  });

  it('shows a tenant-select page with two tenants', async () => {
    const tenantsWrapper = await page.waitForSelector('div[class$=wrapper]');

    await expect(tenantsWrapper).toMatchElement('a:nth-of-type(1)', { text: 'default' });
    await expect(tenantsWrapper).toMatchElement('a:nth-of-type(2)', { text: 'admin' });
  });

  it('can create another tenant', async () => {
    await expect(page).toClick('button', { text: 'Create' });

    await page.waitForTimeout(1000);
    const tenants = await page.$$('div[class$=wrapper] > a');
    expect(tenants.length).toBe(3);
  });

  it('can enter the tenant just created', async () => {
    const button = await page.waitForSelector('div[class$=wrapper] > a:last-of-type');
    const tenantId = await button.evaluate((element) => element.textContent);

    await button.click();

    // Wait for our beautiful logo to show up
    await page.waitForSelector('div[class$=topbar] > svg[viewbox][class$=logo]');
    expect(page.url()).toBe(new URL(`/${tenantId ?? ''}/onboarding/welcome`, logtoCloudUrl).href);
  });

  it('can complete the onboarding welcome process and enter the user survey page', async () => {
    // Select the project type option
    await expect(page).toClick('div[role=radio]:has(input[name=project][value=personal])');

    // Select the deployment type option
    await expect(page).toClick(
      'div[role=radio]:has(input[name=deploymentType][value=open-source])'
    );

    // Click the next button
    await expect(page).toClick('div[class$=actions] button:first-child');

    // Wait for the next page to load
    await expect(page).toMatchElement('div[class$=content] div[class$=title]', {
      text: 'A little bit about you',
    });

    expect(new URL(page.url()).pathname.endsWith('/onboarding/about-user')).toBeTruthy();
  });

  it('can complete the onboarding user survey process and enter the sie page', async () => {
    // Select the first reason option
    await expect(page).toClick('div[role=button][class$=item]');

    // Click the next button
    await expect(page).toClick('div[class$=actions] button:first-child');

    // Wait for the next page to load
    await expect(page).toMatchElement('div[class$=config] div[class$=title]', {
      text: 'Let’s first customize your sign-in experience with ease',
    });

    expect(new URL(page.url()).pathname.endsWith('/onboarding/sign-in-experience')).toBeTruthy();
  });

  it('can complete the sie configuration process and enter the congrats page', async () => {
    // Wait for the sie config to load
    await page.waitForTimeout(1000);

    // Select username as the identifier
    await expect(page).toClick('div[role=radio]:has(input[name=identifier][value=username])');

    // Click the finish button
    await expect(page).toClick('div[class$=continueActions] button:last-child');

    // Wait for the next page to load
    await expect(page).toMatchElement('div[class$=content] div[class$=title]', {
      text: 'Great news! You are qualified to earn Logto Cloud early credit!',
    });

    expect(new URL(page.url()).pathname.endsWith('/onboarding/congrats')).toBeTruthy();
  });

  it('can complete the onboarding process and enter the admin console', async () => {
    // Click the enter ac button
    await expect(page).toClick('div[class$=content] >button');

    // Wait for the admin console to load
    const mainContent = await page.waitForSelector('div[class$=main]:has(div[class$=title])');
    await expect(mainContent).toMatchElement('div[class$=title]', {
      text: 'Something to explore to help you succeed',
    });

    expect(new URL(page.url()).pathname.endsWith('/get-started')).toBeTruthy();
  });

  it('can sign out of admin console', async () => {
    await expect(page).toClick('div[class$=topbar] > div[class$=container]');

    // Try awaiting for 500ms before clicking sign-out button
    await page.waitForTimeout(500);

    await expect(page).toClick(
      '.ReactModalPortal div[class$=dropdownContainer] div[class$=dropdownItem]:last-child'
    );
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    expect(page.url()).toBe(new URL('sign-in', logtoConsoleUrl).href);
  });

  it('can create another account', async () => {
    const newUsername = 'another_admin';
    const newPassword = generatePassword();

    await expect(page).toClick('a', { text: 'Create account' });
    await expect(page).toMatchElement('button', { text: 'Create account' });
    await expect(page).toFill('input[name=identifier]', newUsername);
    await expect(page).toClick('button[name=submit]');

    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    expect(page.url()).toBe(new URL('/register/password', logtoConsoleUrl).href);

    await expect(page).toFillForm('form', {
      newPassword,
      confirmPassword: newPassword,
    });

    await expect(page).toClick('button[name=submit]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    expect(page.url().startsWith(logtoCloudUrl.href)).toBeTruthy();
    expect(new URL(page.url()).pathname.endsWith('/onboarding/welcome')).toBeTruthy();
  });
});
