import { type User } from '@logto/schemas';
import { appendPath } from '@silverhand/essentials';

import { authedAdminTenantApi } from '#src/api/api.js';
import {
  consolePassword,
  consoleUsername,
  isDevFeaturesEnabled,
  logtoConsoleUrl as logtoConsoleUrlString,
} from '#src/constants.js';
import { appendPathname, cls, dcls, expectNavigation, waitFor } from '#src/utils.js';

/**
 * NOTE: This test suite assumes test cases will run sequentially (which is Jest default).
 * Parallel execution will lead to errors.
 */
// Tip: See https://github.com/argos-ci/jest-puppeteer/blob/main/packages/expect-puppeteer/README.md
// for convenient expect methods
describe('smoke testing for console admin account creation and sign-in', () => {
  const logtoConsoleUrl = new URL(logtoConsoleUrlString);

  it('should not navigate to welcome page if admin tenant user table is not empty', async () => {
    // Create a admin user
    const { id } = await authedAdminTenantApi
      .post('users', {
        json: { username: 'test_admin_user' },
      })
      .json<User>();

    await expectNavigation(page.goto(logtoConsoleUrl.href));

    await expect(page).toMatchElement('#app');
    expect(page.url()).not.toBe(new URL('console/welcome', logtoConsoleUrl).href);

    // Clean up
    await authedAdminTenantApi.delete(`users/${id}`);
  });

  it('should navigate to welcome page if all admin user are suspended', async () => {
    // Create a admin user
    const { id } = await authedAdminTenantApi
      .post('users', {
        json: { username: 'test_admin_user' },
      })
      .json<User>();

    await authedAdminTenantApi.patch(`users/${id}/is-suspended`, { json: { isSuspended: true } });

    await expectNavigation(page.goto(logtoConsoleUrl.href));

    await expect(page).toMatchElement('#app');
    expect(page.url()).toBe(new URL('console/welcome', logtoConsoleUrl).href);

    // Clean up
    await authedAdminTenantApi.delete(`users/${id}`);
  });

  it('can open with app element and navigate to welcome page', async () => {
    await expectNavigation(page.goto(logtoConsoleUrl.href));

    await expect(page).toMatchElement('#app');
    expect(page.url()).toBe(new URL('console/welcome', logtoConsoleUrl).href);
  });

  it('can register a new admin account and automatically sign in', async () => {
    await expectNavigation(expect(page).toClick('button', { text: 'Create account' }));

    expect(page.url()).toBe(new URL('register', logtoConsoleUrl).href);

    await expect(page).toFill('input[name=id]', consoleUsername);
    await expectNavigation(expect(page).toClick('button[name=submit]'));

    expect(page.url()).toBe(appendPathname('/register/password', logtoConsoleUrl).href);

    await expect(page).toFillForm('form', {
      newPassword: consolePassword,
      confirmPassword: consolePassword,
    });

    await expectNavigation(expect(page).toClick('button[name=submit]'));

    expect(page.url()).toBe(new URL('console/get-started', logtoConsoleUrl).href);
  });

  it('can sign out of admin console', async () => {
    await expect(page).toClick('div[class$=topbar] > div[class$=container]');

    // Try awaiting for 500ms before clicking sign-out button
    await waitFor(500);

    await expectNavigation(
      expect(page).toClick(
        '.ReactModalPortal div[class$=dropdownContainer] div[class$=dropdownItem]:last-child'
      )
    );

    expect(page.url()).toBe(new URL('sign-in', logtoConsoleUrl).href);
  });

  it('can sign in to admin console again', async () => {
    const initialHref = appendPath(logtoConsoleUrl, 'console', 'applications').href;
    // Should be able to redirect back after sign-in
    await expectNavigation(page.goto(initialHref));
    await expect(page).toFillForm('form', {
      identifier: consoleUsername,
      password: consolePassword,
    });
    await expectNavigation(expect(page).toClick('button[name=submit]'));

    expect(page.url()).toBe(initialHref);

    await expect(page).toClick('div[class$=topbar] > div:last-child');

    const userMenu = await page.waitForSelector('.ReactModalPortal div[class$=dropdownContainer]');
    await expect(userMenu).toMatchElement('div[class$=nameWrapper] > div[class$=name]', {
      text: consoleUsername,
    });

    await expect(page).toClick('div[class^=ReactModal__Overlay]');
  });

  it('renders SVG correctly with viewbox property', async () => {
    await page.waitForSelector('div[class$=topbar] > svg[viewbox][class$=logo]', { visible: true });
  });

  it('can highlight the current tab in the sidebar', async () => {
    const activeSelector = [dcls('sidebar'), 'a' + cls('row') + cls('active'), dcls('title')].join(
      ' '
    );

    await expect(page).toMatchElement(activeSelector, { text: 'Applications', visible: true });
    await expectNavigation(
      expect(page).toClick([dcls('sidebar'), 'a' + cls('row')].join(' '), {
        text: 'Dashboard',
      })
    );
    await expect(page).toMatchElement(activeSelector, { text: 'Dashboard', visible: true });
  });

  it(`should ${isDevFeaturesEnabled ? '' : 'not '}show the dev features label`, async () => {
    await (isDevFeaturesEnabled
      ? expect(page).toMatchElement('div', { text: 'Dev features enabled' })
      : expect(page).not.toMatchElement('div', { text: 'Dev features enabled' }));
  });
});
