import { cls } from '#src/utils.js';

import ExpectConsole from './expect-console.js';
import { expectToClickDetailsPageOption, expectToClickModalAction } from './index.js';

export default class ExpectApiResources extends ExpectConsole {
  /**
   * Go to the api resources page and create a new API resource, then assert that the URL matches
   * the API resource detail page.
   *
   * @param {Object} params The parameters for creating the API resource.
   * @param {string} params.name The name of the API resource to create.
   * @param {string} params.indicator The indicator of the API resource to create.
   */
  async toCreateApiResource({ name, indicator }: { name: string; indicator: string }) {
    await this.gotoPage('/api-resources', 'API resources');
    await this.toClickButton('Create API resource');

    await this.toExpectModal('Start with tutorials');

    // Click bottom button to skip tutorials
    await this.toClickButton('Continue without tutorial', false);

    await this.toExpectModal('Create API resource');

    await this.toFillForm({
      name,
      indicator,
    });

    await this.toClick(
      ['.ReactModalPortal', `button${cls('primary')}`].join(' '),
      'Create API resource',
      false
    );

    this.toMatchUrl(/\/api-resources\/.+$/);
  }

  /**
   * Go to the api resource details page by given resource name and create a new API permission, then assert the permission is created.
   *
   * @param {Object} params The parameters for creating the API permission.
   * @param {string} params.name The name of the API permission to create.
   * @param {string} params.description The description of the API permission to create.
   * @param {string} forResourceName The name of the API resource for which the permission is created.
   */
  async toCreateApiResourcePermission(
    {
      name,
      description,
    }: {
      name: string;
      description: string;
    },
    forResourceName: string
  ) {
    await this.gotoPage('/api-resources', 'API resources');
    await this.toExpectTableHeaders('API name', 'API Identifier');

    await expect(this.page).toClick(['table', 'tbody', 'tr', 'td', `a${cls('title')}`].join(' '), {
      text: forResourceName,
    });

    // Expect the API resource details page
    await expect(this.page).toMatchElement([cls('header'), cls('metadata'), 'div'].join(' '), {
      text: forResourceName,
    });

    await this.toClickButton('Create permission', false);

    await this.toExpectModal('Create permission');

    await this.toFillForm({ name, description });

    await this.toClick(
      ['.ReactModalPortal', `button${cls('primary')}`].join(' '),
      'Create permission',
      false
    );

    await this.waitForToast(`The permission ${name} has been successfully created`);

    await this.toExpectTableCell(name);
  }

  /**
   * Go to the api resource details page by given resource name and delete the API resource.
   *
   * @param {string} name The name of the API resource to delete.
   */
  async toDeleteApiResource(name: string) {
    await this.gotoPage('/api-resources', 'API resources');
    await this.toExpectTableCell(name);
    await this.toClickTableCell(name);

    await expectToClickDetailsPageOption(this.page, 'Delete');

    await this.toExpectModal('Reminder');
    await this.toFill('.ReactModalPortal input', name);

    await expectToClickModalAction(this.page, 'Delete');
    await this.waitForToast(`The API resource ${name} has been successfully deleted`);
  }
}
