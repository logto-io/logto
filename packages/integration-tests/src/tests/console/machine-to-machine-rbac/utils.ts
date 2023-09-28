import { type Page } from 'puppeteer';

import {
  expectModalWithTitle,
  expectToClickModalAction,
  waitForToast,
} from '#src/ui-helpers/index.js';

import {
  expectFrameworkExists,
  expectToClickFramework,
  expectToProceedCreationFrom,
  expectFrameworksInGroup,
} from '../applications/helpers.js';

const m2mFramework = 'Machine-to-machine';

export const createM2mApp = async (
  page: Page,
  { name, description }: { name: string; description: string }
) => {
  await expect(page).toClick('div[class$=headline] button span', { text: 'Create Application' });

  await expectModalWithTitle(page, 'Start with SDK and guides');

  await expectFrameworksInGroup(page, '.ReactModalPortal div[class$=guideGroup]:has(>label)');

  // Expect the framework contains on the page
  await expectFrameworkExists(page, m2mFramework);

  // Filter
  await expect(page).toFill('div[class$=searchInput] input', m2mFramework);

  // Expect the framework exists after filtering
  await expectFrameworkExists(page, m2mFramework);

  await expectToClickFramework(page, m2mFramework);

  await expectToProceedCreationFrom(page, {
    name,
    description,
  });

  // Skip guide
  await page.keyboard.press('Escape');
};

export const createM2mRoleAndAssignPermissions = async (
  page: Page,
  { roleName, roleDescription }: { roleName: string; roleDescription: string },
  apiResources: Array<{ apiResourceName: string; permissionName: string }>
) => {
  await expect(page).toClick('div[class$=headline] button span', {
    text: 'Create Role',
  });

  await expectModalWithTitle(page, 'Create Role');

  // Expand role type selection
  await expect(page).toClick('button[class$=roleTypeSelectionSwitch] span', {
    text: 'Show more options',
  });

  await expect(page).toClick('div[class*=radioGroup][class$=roleTypes] content', {
    text: 'Machine-to-machine app role',
  });

  await expect(page).toFillForm('.ReactModalPortal form', {
    name: roleName,
    description: roleDescription,
  });

  /* eslint-disable no-await-in-loop */
  for (const apiResource of apiResources) {
    const { apiResourceName, permissionName } = apiResource;
    // Assign customized permission
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
  }
  /* eslint-enable no-await-in-loop */

  await expectToClickModalAction(page, 'Create Role');

  await waitForToast(page, {
    text: `The role ${roleName} has been successfully created.`,
  });

  await expectModalWithTitle(page, 'Assign users');
  await expectToClickModalAction(page, 'Skip for now');

  await expect(page).toMatchElement('div[class$=header] div[class$=info] div[class$=name]', {
    text: roleName,
  });
};
