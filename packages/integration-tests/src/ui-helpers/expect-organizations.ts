import { cls } from '#src/utils.js';

import ExpectConsole from './expect-console.js';

export default class ExpectOrganizations extends ExpectConsole {
  /**
   * Go to the organizations page and create a new organization, then assert that the URL matches
   * the organization detail page.
   *
   * @param name The name of the organization to create.
   */
  async toCreateOrganization(name: string) {
    await this.gotoPage('/organizations', 'Organizations');
    await this.toClickButton('Create organization');

    await this.toExpectModal('Create organization');
    await this.toFillForm({
      name,
    });
    await this.toClick(['.ReactModalPortal', `button${cls('primary')}`].join(' '), 'Create', false);
    this.toMatchUrl(/\/organizations\/.+$/);
  }
}
