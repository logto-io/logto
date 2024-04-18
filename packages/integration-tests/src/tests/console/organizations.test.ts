import ExpectOrganizations from '#src/ui-helpers/expect-organizations.js';
import { cls, dcls, generateTestName } from '#src/utils.js';

const expectOrg = new ExpectOrganizations(await browser.newPage());

// Start the test by signing in or starting the console
await expectOrg.start();

describe('organizations: create, edit, and delete organization', () => {
  it('navigates to organizations page', async () => {
    await expectOrg.gotoPage('/organizations', 'Organizations');
  });

  it('should be able to see the table', async () => {
    await expectOrg.toExpectTableHeaders('Name', 'Organization ID', 'Members');
  });

  it('should be able to create a new organization', async () => {
    await expectOrg.toCreateOrganization('Test organization');
  });

  it('should be able to edit the created organization', async () => {
    await expectOrg.toExpectTabs('Settings', 'Members');

    const nameUpdated = 'Test organization updated';
    await expectOrg.toFillForm({
      name: nameUpdated,
      description: 'Test organization description',
    });
    await expectOrg.toSaveChanges();
    await expectOrg.toMatchElement([dcls('header'), dcls('metadata'), dcls('name')].join(' '), {
      text: nameUpdated,
    });
  });

  it('should be able to delete the created organization', async () => {
    // Open the dropdown menu
    await expectOrg.toClick(
      [dcls('header'), `button${cls('withIcon')}`].join(' '),
      undefined,
      false
    );
    await expectOrg.toClick(`${dcls('danger')}[role=menuitem]`, 'Delete', false);
    await expectOrg.toExpectModal('Reminder');
    await expectOrg.toClick(['.ReactModalPortal', `button${cls('danger')}`].join(' '), 'Delete');
    expectOrg.toMatchUrl(/\/organizations$/);
  });
});

describe('organizations: search organization', () => {
  const [testName1, testName2] = [generateTestName(), generateTestName()];

  it('creates two organizations', async () => {
    await expectOrg.toCreateOrganization(testName1);
    await expectOrg.toCreateOrganization(testName2);
    await expectOrg.gotoPage('/organizations', 'Organizations');
  });

  it('should be able to search organization', async () => {
    await expectOrg.toFill([dcls('search'), 'input'].join(' '), testName1);
    await expectOrg.toClickButton('Search', false);
    await expectOrg.toExpectTableCell(testName1);

    // This will work as expected since we can ensure the search result is ready from the previous step
    await expect(expectOrg.page).not.toMatchElement([`table`, 'tbody', 'tr', 'td'].join(' '), {
      text: new RegExp(testName2, 'i'),
      visible: true,
    });
  });
});
