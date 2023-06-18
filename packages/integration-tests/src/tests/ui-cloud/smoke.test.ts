import { defaultTenantId } from '@logto/schemas';
import { appendPath } from '@silverhand/essentials';
import { setDefaultOptions } from 'expect-puppeteer';

import { logtoCloudUrl as logtoCloudUrlString, logtoConsoleUrl } from '#src/constants.js';
import { generatePassword } from '#src/utils.js';

await page.setViewport({ width: 1280, height: 720 });
setDefaultOptions({ timeout: 5000 });

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

  const createTenantName = 'new-tenant';

  it('can open with app element and navigate to register page', async () => {
    await page.goto(logtoCloudUrl.href);
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    await expect(page.waitForSelector('#app')).resolves.not.toBeNull();
    expect(page.url()).toBe(appendPath(adminTenantUrl, '/register').href);
  });

  it('can register the first admin account', async () => {
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

    expect(page.url()).toBe(
      appendPath(logtoCloudUrl, `/${defaultTenantId}/onboarding/welcome`).href
    );
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
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    const mainContent = await page.waitForSelector('div[class$=main]:has(div[class$=title])');
    await expect(mainContent).toMatchElement('div[class$=title]', {
      text: 'Something to explore to help you succeed',
    });

    expect(new URL(page.url()).pathname.endsWith('/get-started')).toBeTruthy();
  });

  it('can create a new tenant using tenant dropdown', async () => {
    // Click 'current tenant card' locates in topbar
    const currentTenantCard = await page.waitForSelector(
      'div[class$=topbar] > div[class$=currentTenantCard][role=button]:has(div[class$=name])'
    );
    await expect(currentTenantCard).toMatchElement('div[class$=name]', { text: 'My Project' });
    await currentTenantCard.click();

    await page.waitForTimeout(500);
    const createTenantButton = await page.waitForSelector(
      'div[class$=ReactModalPortal] div[class$=dropdownContainer] > div[class$=dropdown] > div[class$=createTenantButton][role=button]:has(div)'
    );
    await expect(createTenantButton).toMatchElement('div', { text: 'Create tenant' });
    await createTenantButton.click();

    // Create tenant with name 'new-tenant' and tag 'production'
    await page.waitForTimeout(500);
    await page.waitForSelector(
      'div[class$=ReactModalPortal] div[class*=card][class$=medium] input[type=text][name=name]'
    );
    await page.waitForSelector(
      'div[class$=ReactModalPortal] div[class*=radioGroup][class$=small] div[class*=radio][class$=small][role=radio] > div[class$=content]:has(input[value=production])'
    );
    await expect(page).toFill(
      'div[class$=ReactModalPortal] div[class*=card][class$=medium] input[type=text][name=name]',
      createTenantName
    );
    await expect(page).toClick(
      'div[class$=ReactModalPortal] div[class*=radioGroup][class$=small] div[class*=radio][class$=small][role=radio] > div[class$=content]:has(input[value=production])'
    );

    // Click create button
    await page.waitForTimeout(500);
    await expect(page).toClick(
      'div[class$=ReactModalPortal] div[class*=card][class$=medium] div[class$=footer] button[type=submit]'
    );

    expect(new URL(page.url()).pathname.endsWith(`${defaultTenantId}/get-started`)).toBeTruthy();
  });

  it('check current tenant list and switch to new tenant', async () => {
    // Wait for toast to disappear.
    await page.waitForTimeout(5000);

    // Click 'current tenant card' locates in topbar
    const currentTenantCard = await page.waitForSelector(
      'div[class$=topbar] > div[class$=currentTenantCard][role=button]:has(div[class$=name])'
    );
    await expect(currentTenantCard).toMatchElement('div[class$=name]', { text: 'My Project' });
    await currentTenantCard.click();

    const newTenant = await page.waitForSelector(
      'div[class$=ReactModalPortal] div[class$=dropdownContainer] div[class$=dropdownItem]:first-child'
    );
    await expect(newTenant).toMatchElement('div[class$=dropdownName]', { text: createTenantName });
    await newTenant.click();

    await page.waitForNavigation({ waitUntil: 'networkidle0' });
  });

  it('can sign out of admin console', async () => {
    // Check if the current tenant is switched to new tenant.
    const currentTenantCard = await page.waitForSelector(
      'div[class$=topbar] > div[class$=currentTenantCard][role=button]:has(div[class$=name])'
    );
    await expect(currentTenantCard).toMatchElement('div[class$=name]', { text: createTenantName });

    const userInfoButton = await page.waitForSelector('div[class$=topbar] > div[class$=container]');
    await userInfoButton.click();

    // Try awaiting for 500ms before clicking sign-out button
    await page.waitForTimeout(500);

    const signOutButton = await page.waitForSelector(
      'div[class$=ReactModalPortal] div[class$=dropdownContainer] div[class$=dropdownItem]:last-child'
    );
    await signOutButton.click();

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

    expect(page.url().startsWith(logtoCloudUrl.origin)).toBeTruthy();
    expect(page.url().endsWith('/onboarding/welcome')).toBeTruthy();
  });
});
