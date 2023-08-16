import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import {
  expectConfirmModalAndAct,
  expectToClickDetailsPageOption,
  goToAdminConsole,
  waitForToaster,
} from '#src/ui-helpers/index.js';
import {
  expectNavigation,
  appendPathname,
  generateUsername,
  generateResourceName,
  generateResourceIndicator,
  generateScopeName,
  generateRoleName,
} from '#src/utils.js';

await page.setViewport({ width: 1920, height: 1080 });

describe('RBAC', () => {
  const logtoConsoleUrl = new URL(logtoConsoleUrlString);
  const apiResourceName = generateResourceName();
  const apiResourceIndicator = generateResourceIndicator();
  const permissionName = generateScopeName();
  const permissionDescription = 'Dummy permission description';
  const roleName = generateRoleName();
  const roleDescription = 'Dummy role description';
  const rbacTestUsername = generateUsername();

  beforeAll(async () => {
    await goToAdminConsole();
  });

  it('navigate to api resources page', async () => {
    await expectNavigation(
      page.goto(appendPathname('/console/api-resources', logtoConsoleUrl).href)
    );

    await expect(page).toMatchElement(
      'div[class$=main] div[class$=headline] div[class$=titleEllipsis]',
      {
        text: 'API Resources',
      }
    );
  });

  it('create an api resource', async () => {
    await expect(page).toClick('div[class$=headline] button span', {
      text: 'Create API Resource',
    });

    await expect(page).toMatchElement(
      '.ReactModalPortal div[class$=header] div[class$=titleEllipsis]',
      {
        text: 'Create API Resource',
      }
    );

    await expect(page).toFillForm('.ReactModalPortal form', {
      name: apiResourceName,
      indicator: apiResourceIndicator,
    });

    await expect(page).toClick('.ReactModalPortal div[class$=footer] button[type=submit] span', {
      text: 'Create API Resource',
    });

    await waitForToaster(page, {
      text: `The API resource ${apiResourceName} has been successfully created`,
    });

    await expect(page).toMatchElement('div[class$=header] div[class$=info] div[class$=name]', {
      text: apiResourceName,
    });
  });

  it('create api permissions', async () => {
    await expect(page).toClick('nav div[class$=item] div[class$=link] a', {
      text: 'Permissions',
    });

    await expect(page).toClick('div[class$=filter] button[class$=createButton] span', {
      text: 'Create Permission',
    });

    await expect(page).toMatchElement(
      '.ReactModalPortal div[class$=header] div[class$=titleEllipsis]',
      {
        text: 'Create permission',
      }
    );

    await expect(page).toFillForm('.ReactModalPortal form', {
      name: permissionName,
      description: permissionDescription,
    });

    await expect(page).toClick('.ReactModalPortal div[class$=footer] button[type=submit] span', {
      text: 'Create permission',
    });

    await waitForToaster(page, {
      text: `The permission ${permissionName} has been successfully created`,
    });

    await expect(page).toMatchElement('table tbody tr td div[class$=name]', {
      text: permissionName,
    });
  });

  it('navigate to user management page', async () => {
    await expectNavigation(page.goto(appendPathname('/console/users', logtoConsoleUrl).href));
    await expect(page).toMatchElement(
      'div[class$=main] div[class$=headline] div[class$=titleEllipsis]',
      {
        text: 'User Management',
      }
    );
  });

  it('create a user for rbac testing', async () => {
    await expect(page).toClick('div[class$=headline] button span', { text: 'Add User' });

    await expect(page).toMatchElement(
      '.ReactModalPortal div[class$=header] div[class$=titleEllipsis]',
      {
        text: 'Add User',
      }
    );

    await expect(page).toFillForm('.ReactModalPortal form', {
      username: rbacTestUsername,
    });

    await expect(page).toClick('.ReactModalPortal div[class$=footer] button[type=submit] span', {
      text: 'Add User',
    });

    await expect(page).toMatchElement(
      '.ReactModalPortal div[class$=header] div[class$=titleEllipsis]',
      { text: 'This user has been successfully created' }
    );

    await page.keyboard.press('Escape');
  });

  it('navigate to roles page', async () => {
    await expectNavigation(page.goto(appendPathname('/console/roles', logtoConsoleUrl).href));

    await expect(page).toMatchElement(
      'div[class$=main] div[class$=headline] div[class$=titleEllipsis]',
      {
        text: 'Roles',
      }
    );
  });

  it('create a role and assign permissions to the role', async () => {
    await expect(page).toClick('div[class$=headline] button span', {
      text: 'Create Role',
    });

    await expect(page).toMatchElement(
      '.ReactModalPortal div[class$=header] div[class$=titleEllipsis]',
      {
        text: 'Create Role',
      }
    );

    await expect(page).toFillForm('.ReactModalPortal form', {
      name: roleName,
      description: roleDescription,
    });

    // Assign permission
    await expect(page).toClick(
      '.ReactModalPortal div[class$=resourceItem] div[class$=title] div[class$=name]',
      {
        text: apiResourceName,
      }
    );

    await expect(page).toClick(
      '.ReactModalPortal div[class$=resourceItem] div[class$=sourceScopeItem] div[role=button]',
      {
        text: permissionName,
      }
    );

    await expect(page).toClick('.ReactModalPortal div[class$=footer] button[type=submit] span', {
      text: 'Create Role',
    });

    await waitForToaster(page, {
      text: `The role ${roleName} has been successfully created.`,
    });

    await expect(page).toMatchElement(
      '.ReactModalPortal div[class$=header] div[class$=titleEllipsis]',
      {
        text: 'Assign users',
      }
    );

    await expect(page).toClick('.ReactModalPortal div[class$=footer] button span', {
      text: 'Skip for now',
    });

    await expect(page).toMatchElement('div[class$=header] div[class$=info] div[class$=name]', {
      text: roleName,
    });
  });

  it('delete a permission from a role on the role details page', async () => {
    await expect(page).toClick('nav div[class$=item] div[class$=link] a', {
      text: 'Permissions',
    });

    const permissionRow = await expect(page).toMatchElement(
      'table tbody tr:has(td div[class$=name])',
      { text: permissionName }
    );
    await expect(permissionRow).toClick('td[class$=deleteColumn] button');

    await expect(page).toMatchElement(
      '.ReactModalPortal div[class$=header] div[class$=titleEllipsis]',
      {
        text: 'Reminder',
      }
    );

    await expect(page).toClick('.ReactModalPortal div[class$=footer] button span', {
      text: 'Remove',
    });

    await waitForToaster(page, {
      text: `The permission "${permissionName}" was successfully removed from this role`,
    });
  });

  it('assign a permission to a role on the role details page', async () => {
    await expect(page).toClick('div[class$=filter] button span', {
      text: 'Assign Permissions',
    });

    await expect(page).toMatchElement(
      '.ReactModalPortal div[class$=header] div[class$=titleEllipsis]',
      {
        text: 'Assign permissions',
      }
    );

    await expect(page).toClick(
      '.ReactModalPortal div[class$=resourceItem] div[class$=title] div[class$=name]',
      {
        text: apiResourceName,
      }
    );

    await expect(page).toClick(
      '.ReactModalPortal div[class$=resourceItem] div[class$=sourceScopeItem] div[role=button]',
      {
        text: permissionName,
      }
    );

    await expect(page).toClick('.ReactModalPortal div[class$=footer] button span', {
      text: 'Assign Permissions',
    });

    await waitForToaster(page, {
      text: 'The selected permissions were successfully assigned to this role',
    });

    await expect(page).toMatchElement('table tbody tr:has(td div[class$=name])', {
      text: permissionName,
    });
  });

  it('assign a role to a user on the role details page', async () => {
    await expect(page).toClick('nav div[class$=item] div[class$=link] a', {
      text: 'Users',
    });

    await expect(page).toClick('div[class$=filter] button span', {
      text: 'Assign Users',
    });

    await expect(page).toMatchElement(
      '.ReactModalPortal div[class$=header] div[class$=titleEllipsis]',
      {
        text: 'Assign users',
      }
    );

    await expect(page).toClick(
      '.ReactModalPortal div[class$=roleUsersTransfer] div[class$=item] div[class$=title]',
      {
        text: rbacTestUsername,
      }
    );

    await expect(page).toClick('.ReactModalPortal div[class$=footer] button span', {
      text: 'Assign users',
    });

    await waitForToaster(page, {
      text: 'The selected users were successfully assigned to this role',
    });

    await expect(page).toMatchElement(
      'div[class$=usersTable] td div[class$=item] a[class$=title]',
      {
        text: rbacTestUsername,
      }
    );
  });

  it('remove a role form a user on the user details page', async () => {
    // Navigate to user details page
    await expect(page).toClick('table tbody tr td a[class$=title]', {
      text: rbacTestUsername,
    });

    await expect(page).toMatchElement('div[class$=header] div[class$=title]', {
      text: rbacTestUsername,
    });

    // Go to roles tab
    await expect(page).toClick('nav div[class$=item] div[class$=link] a', {
      text: 'Roles',
    });

    const roleRow = await expect(page).toMatchElement('table tbody tr:has(td a[class$=name])', {
      text: roleName,
    });

    // Click remove button
    await expect(roleRow).toClick('td:last-of-type button');

    await expect(page).toMatchElement(
      '.ReactModalPortal div[class$=header] div[class$=titleEllipsis]',
      {
        text: 'Reminder',
      }
    );

    await expect(page).toClick('.ReactModalPortal div[class$=footer] button span', {
      text: 'Remove',
    });

    await waitForToaster(page, {
      text: `${roleName} was successfully removed from this user.`,
    });
  });

  it('add a role to a user on the user details page', async () => {
    await expect(page).toClick('div[class$=filter] button span', {
      text: 'Assign Roles',
    });

    await expect(page).toMatchElement(
      '.ReactModalPortal div[class$=header] div[class$=titleEllipsis]',
      {
        text: `Assign roles to ${rbacTestUsername}`,
      }
    );

    await expect(page).toClick(
      '.ReactModalPortal div[class$=rolesTransfer] div[class$=item] div[class$=name]',
      {
        text: roleName,
      }
    );

    await expect(page).toClick('.ReactModalPortal div[class$=footer] button span', {
      text: 'Assign roles',
    });

    await waitForToaster(page, {
      text: 'Successfully assigned role(s)',
    });
  });

  // Clean up
  it('delete the test user', async () => {
    await expectToClickDetailsPageOption(page, 'Delete');
    await expectConfirmModalAndAct(page, {
      title: 'Reminder',
      actionText: 'Delete',
    });

    await waitForToaster(page, {
      text: 'The user has been successfully deleted',
    });

    expect(page.url()).toBe(new URL(`console/users`, logtoConsoleUrl).href);
  });

  it('delete the role', async () => {
    await expectNavigation(page.goto(appendPathname('/console/roles', logtoConsoleUrl).href));

    await expect(page).toMatchElement(
      'div[class$=main] div[class$=headline] div[class$=titleEllipsis]',
      {
        text: 'Roles',
      }
    );

    await expect(page).toClick('table tbody tr td a[class$=title]', {
      text: roleName,
    });

    await expect(page).toMatchElement('div[class$=header] div[class$=info] div[class$=name]', {
      text: roleName,
    });

    await expectToClickDetailsPageOption(page, 'Delete');
    await expectConfirmModalAndAct(page, {
      title: 'Reminder',
      actionText: 'Delete',
    });

    await waitForToaster(page, {
      text: `${roleName} was successfully deleted`,
    });

    expect(page.url()).toBe(new URL(`console/roles`, logtoConsoleUrl).href);
  });

  it('delete permission', async () => {
    await expectNavigation(
      page.goto(appendPathname('/console/api-resources', logtoConsoleUrl).href)
    );

    await expect(page).toMatchElement(
      'div[class$=main] div[class$=headline] div[class$=titleEllipsis]',
      {
        text: 'API Resources',
      }
    );

    await expect(page).toClick('table tbody tr td a[class$=title]', {
      text: apiResourceName,
    });

    await expect(page).toMatchElement('div[class$=header] div[class$=info] div[class$=name]', {
      text: apiResourceName,
    });

    // Navigate to permissions tab
    await expect(page).toClick('nav div[class$=item] div[class$=link] a', {
      text: 'Permissions',
    });
    const permissionRow = await expect(page).toMatchElement(
      'table tbody tr:has(td div[class$=name])',
      { text: permissionName }
    );
    await expect(permissionRow).toClick('td[class$=deleteColumn] button');

    await expect(page).toMatchElement(
      '.ReactModalPortal div[class$=header] div[class$=titleEllipsis]',
      {
        text: 'Reminder',
      }
    );

    await expect(page).toClick('.ReactModalPortal div[class$=footer] button span', {
      text: 'Delete',
    });

    await waitForToaster(page, {
      text: `The permission "${permissionName}" was successfully deleted.`,
    });
  });

  it('delete api resource', async () => {
    await expectToClickDetailsPageOption(page, 'Delete');

    await expect(page).toMatchElement(
      '.ReactModalPortal div[class$=header] div[class$=titleEllipsis]',
      {
        text: 'Reminder',
      }
    );

    await expect(page).toFill('.ReactModalPortal input', apiResourceName);

    await expect(page).toClick('.ReactModalPortal div[class$=footer] button span', {
      text: 'Delete',
    });

    await waitForToaster(page, {
      text: `The API Resource ${apiResourceName} has been successfully deleted`,
    });

    expect(page.url()).toBe(new URL(`console/api-resources`, logtoConsoleUrl).href);
  });
});
