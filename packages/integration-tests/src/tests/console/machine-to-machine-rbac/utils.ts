import { type Page } from 'puppeteer';

import {
  expectModalWithTitle,
  expectToClickModalAction,
  waitForToast,
} from '#src/ui-helpers/index.js';

export const createM2mRoleAndAssignPermissions = async (
  page: Page,
  { roleName, roleDescription }: { roleName: string; roleDescription: string },
  apiResources: Array<{ apiResourceName: string; permissionName: string }>
) => {
  await expect(page).toClick('div[class$=headline] button span', {
    text: 'Create role',
  });

  await expectModalWithTitle(page, 'Create role');

  // Expand role type selection
  await expect(page).toClick('button[class$=roleTypeSelectionSwitch] span', {
    text: 'Show more options',
  });

  await expect(page).toClick('div[class*=radioGroup][class$=roleTypes] div[class$=content]', {
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

  await expectToClickModalAction(page, 'Create role');

  await waitForToast(page, {
    text: `The role ${roleName} has been successfully created.`,
  });

  await expectModalWithTitle(page, 'Assign apps');
  await expectToClickModalAction(page, 'Skip for now');

  await expect(page).toMatchElement('div[class$=header] div[class$=metadata] div[class$=name]', {
    text: roleName,
  });
};
