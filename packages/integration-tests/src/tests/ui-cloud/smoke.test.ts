import { defaultTenantId } from '@logto/schemas';
import { appendPath } from '@silverhand/essentials';
import { setDefaultOptions } from 'expect-puppeteer';

import { logtoCloudUrl as logtoCloudUrlString, logtoConsoleUrl } from '#src/constants.js';
import { generatePassword } from '#src/utils.js';

import {
  onboardingWelcome,
  onboardingUserSurvey,
  onboardingSieConfig,
  onboardingFinish,
  createNewTenant,
  fillAndCreateTenant,
  openTenantDropdown,
  openCreateTenantModal,
} from './operations.js';

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
    await onboardingWelcome(page);

    // Wait for the next page to load
    await expect(page).toMatchElement('div[class$=content] div[class$=title]', {
      text: 'A little bit about you',
    });

    expect(new URL(page.url()).pathname.endsWith('/onboarding/about-user')).toBeTruthy();
  });

  it('can complete the onboarding user survey process and enter the sie page', async () => {
    await onboardingUserSurvey(page);

    // Wait for the next page to load
    await expect(page).toMatchElement('div[class$=config] div[class$=title]', {
      text: 'Let’s first customize your sign-in experience with ease',
    });

    expect(new URL(page.url()).pathname.endsWith('/onboarding/sign-in-experience')).toBeTruthy();
  });

  it('can complete the sie configuration process and enter the congrats page', async () => {
    await onboardingSieConfig(page);

    // Wait for the next page to load
    await expect(page).toMatchElement('div[class$=content] div[class$=title]', {
      text: 'Great news! You are qualified to earn Logto Cloud early credit!',
    });

    expect(new URL(page.url()).pathname.endsWith('/onboarding/congrats')).toBeTruthy();
  });

  it('can complete the onboarding process and enter the admin console', async () => {
    await onboardingFinish(page);
    const mainContent = await page.waitForSelector('div[class$=main]:has(div[class$=title])');
    await expect(mainContent).toMatchElement('div[class$=title]', {
      text: 'Something to explore to help you succeed',
    });

    expect(new URL(page.url()).pathname.endsWith('/get-started')).toBeTruthy();
  });

  it('can create a new tenant using tenant dropdown', async () => {
    await page.waitForTimeout(2000);
    await createNewTenant(page, createTenantName);

    expect(new URL(page.url()).pathname.endsWith(`/get-started`)).toBeTruthy();
  });

  it('should navigate to the new tenant', async () => {
    // Wait for toast to disappear.
    await page.waitForTimeout(5000);

    // Click 'current tenant card' locates in topbar
    const currentTenantCard = await page.waitForSelector(
      'div[class$=topbar] > div[class$=currentTenantCard][role=button]:has(div[class$=name])'
    );
    await expect(currentTenantCard).toMatchElement('div[class$=name]', { text: createTenantName });
  });

  it('can sign out of admin console', async () => {
    const userInfoButton = await page.waitForSelector('div[class$=topbar] > div[class$=container]');
    await userInfoButton?.click();

    // Try awaiting for 500ms before clicking sign-out button
    await page.waitForTimeout(500);

    const signOutButton = await page.waitForSelector(
      'div[class$=ReactModalPortal] div[class$=dropdownContainer] div[class$=dropdownItem]:last-child'
    );
    await signOutButton?.click();

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

  it('can complete onboarding process with new account', async () => {
    await onboardingWelcome(page);
    await onboardingUserSurvey(page);
    await onboardingSieConfig(page);
    await onboardingFinish(page);

    await page.waitForTimeout(1000);
    expect(new URL(page.url()).pathname.endsWith('/get-started')).toBeTruthy();
  });

  it('go to tenant settings and delete current tenant', async () => {
    await page.waitForTimeout(2000);
    const tenantSettingButton = await page.waitForSelector(
      'div[class$=content] > div[class$=sidebar] a[class$=row][href$=tenant-settings] > div[class$=title]'
    );
    await tenantSettingButton?.click();

    const deleteButton = await page.waitForSelector(
      'div[class$=main] form[class$=container] div[class$=deletionButtonContainer] button[class$=medium][type=button]'
    );
    await deleteButton?.click();

    const textInput = await page.waitForSelector(
      'div[class$=ReactModalPortal] div[class$=container] input[type=text]'
    );
    await textInput?.type('My Project');

    const deleteConfirmButton = await page.waitForSelector(
      'div[class$=ReactModalPortal] div[class$=footer] > button:last-child'
    );
    await deleteConfirmButton?.click();

    await page.waitForTimeout(2000);
    const placeholderTitle = await page.waitForSelector(
      'div[class$=pageContainer] div[class$=placeholder]:has(div[class$=title])'
    );
    await expect(placeholderTitle).toMatchElement('div[class$=title]', {
      text: 'You haven’t created a tenant yet',
    });
  });

  it('can create tenant from landing page', async () => {
    const createTenantButton = await page.waitForSelector(
      'div[class$=pageContainer] div[class$=placeholder] button[class$=button][type=button]'
    );
    await createTenantButton?.click();

    await fillAndCreateTenant(page, 'tenant1');
    await page.waitForTimeout(5000);
    expect(new URL(page.url()).pathname.endsWith('/get-started')).toBeTruthy();
  });

  it('can create two more tenant for new account', async () => {
    await createNewTenant(page, 'tenant2');
    await page.waitForTimeout(5000);
    await createNewTenant(page, 'tenant3');
    await page.waitForTimeout(5000);
    expect(new URL(page.url()).pathname.endsWith('/get-started')).toBeTruthy();
  });

  it('can not open create tenant modal when reach the limit', async () => {
    await page.waitForTimeout(2000);
    await openTenantDropdown(page);
    await openCreateTenantModal(page);

    await page.waitForTimeout(500);
    const pageTitle = await page.waitForSelector(
      'div[class$=main] > div[class$=container] > div[class$=header]:has(div[class$=title])'
    );
    await expect(pageTitle).toMatchElement('div[class$=title]', {
      text: 'Something to explore to help you succeed',
    });
  });
});
