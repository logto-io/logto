import { ApplicationType } from '@logto/schemas';

import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import {
  expectConfirmModalAndAct,
  expectModalWithTitle,
  expectToClickModalAction,
  expectToDiscardChanges,
  expectToOpenNewPage,
  expectToSaveChanges,
  expectUnsavedChangesAlert,
  goToAdminConsole,
  waitForToast,
} from '#src/ui-helpers/index.js';
import { expectNavigation, appendPathname } from '#src/utils.js';

import {
  type ApplicationMetadata,
  applicationTypesMetadata,
  initialApp,
  testApp,
  thirdPartyApp,
} from './constants.js';
import {
  expectFrameworkExists,
  expectToChooseAndClickApplicationFramework,
  expectToProceedApplicationCreationFrom,
  expectToProceedSdkGuide,
  expectToProceedAppDeletion,
  expectFrameworksInGroup,
} from './helpers.js';

await page.setViewport({ width: 1920, height: 1080 });

describe('applications', () => {
  const logtoConsoleUrl = new URL(logtoConsoleUrlString);

  beforeAll(async () => {
    await goToAdminConsole();
  });

  it('navigate to applications page', async () => {
    await expectNavigation(
      page.goto(appendPathname('/console/applications', logtoConsoleUrl).href)
    );

    expect(page.url()).toBe(new URL('/console/applications', logtoConsoleUrl).href);
  });

  it('the table placeholder should be rendered correctly', async () => {
    await expect(page).toMatchElement(
      'div[class$=guideLibraryContainer] div[class$=titleEllipsis]',
      { text: 'Select a framework or tutorial', timeout: 2000 }
    );

    await expectFrameworksInGroup(page, 'div[class$=guideGroup]:has(>label)');
  });

  it('create the initial application from the table placeholder', async () => {
    await expectToChooseAndClickApplicationFramework(page, initialApp.framework);

    await expectToProceedApplicationCreationFrom(page, initialApp);

    await expectToProceedSdkGuide(page, initialApp, true);

    // Details page
    await expect(page).toMatchElement('div[class$=main] div[class$=header] div[class$=name]', {
      text: initialApp.name,
    });

    // Back to application list page
    await expectNavigation(
      expect(page).toClick('div[class$=main] a[class$=backLink]', {
        text: 'Back to applications',
      })
    );

    expect(page.url()).toBe(new URL('/console/applications', logtoConsoleUrl).href);

    /**
     * Note:
     * Reload the page to refresh new application data by the SWR,
     * since test operations is so quick and the SWR is not updated
     */
    await page.reload();

    await expect(page).toMatchElement('table div[class$=item] a[class$=title]', {
      text: initialApp.name,
    });
  });

  it('can open the logto github repo issue page when click on the framework not found button', async () => {
    await expect(page).toClick('div[class$=main] div[class$=headline] button span', {
      text: 'Create application',
    });

    await expectModalWithTitle(page, 'Start with SDK and guides');

    // Click request sdk button
    await expect(page).toClick(
      '.ReactModalPortal div[class$=header] button[class$=requestSdkButton]'
    );

    await expectToOpenNewPage(browser, 'https://github.com/logto-io/logto/issues');

    // Return to the application list page
    await expectNavigation(
      expect(page).toClick('.ReactModalPortal div[class$=header] button:has(svg[class$=closeIcon])')
    );

    expect(page.url()).toBe(new URL('/console/applications', logtoConsoleUrl).href);
  });

  it('can create an application by framework from the app creation modal and modify its data', async () => {
    await expect(page).toClick('div[class$=main] div[class$=headline] button span', {
      text: 'Create application',
    });

    await expectModalWithTitle(page, 'Start with SDK and guides');

    await expectFrameworksInGroup(page, '.ReactModalPortal div[class$=guideGroup]:has(>label)');

    // Expect the framework contains on the page
    await expectFrameworkExists(page, testApp.framework);

    // Filter
    await expect(page).toFill('div[class$=searchInput] input', testApp.framework);

    // Expect the framework exists after filtering
    await expectFrameworkExists(page, testApp.framework);

    await expectToChooseAndClickApplicationFramework(page, testApp.framework);

    await expectToProceedApplicationCreationFrom(page, testApp);

    await expectToProceedSdkGuide(page, testApp);

    // Expect on the details page
    await expect(page).toMatchElement('div[class$=main] div[class$=header] div[class$=name]', {
      text: testApp.name,
    });

    // Check guide
    await expect(page).toClick('div[class$=header] button span', { text: 'Check guide' });

    // Wait for the guide drawer to be ready
    await page.waitForTimeout(500);

    // Close guide
    await expect(page).toClick(
      '.ReactModalPortal div[class$=drawerContainer] div[class$=header] button:last-of-type'
    );

    // Wait for the guide drawer to disappear
    await page.waitForSelector('.ReactModalPortal div[class$=drawerContainer]', { hidden: true });

    // Update application data
    await expect(page).toFillForm('form', {
      description: `(New): ${testApp.description}`,
    });

    await expectUnsavedChangesAlert(page);

    await expectToSaveChanges(page);
    await waitForToast(page, { text: 'Saved' });

    const redirectUriFiled = await expect(page).toMatchElement(
      'div[class$=field]:has(>div[class$=headline]>div[class$=title]',
      { text: 'Redirect URIs' }
    );

    // Add and remove redirect uri
    await expect(redirectUriFiled).toClick('div[class$=multilineInput]>button>span', {
      text: 'Add another',
    });

    // Wait for the new redirect uri field
    await page.waitForSelector(
      'div:has(>div[class$=deletableInput]):last-of-type button:has(svg[class$=minusIcon])'
    );

    await expect(redirectUriFiled).toFill(
      'div:has(>div[class$=deletableInput]):last-of-type input',
      `${testApp.redirectUri}/v2`
    );

    await expectToSaveChanges(page);

    await waitForToast(page, { text: 'Saved' });

    // Click delete button
    await expect(redirectUriFiled).toClick(
      'div:has(>div[class$=deletableInput]):last-of-type button:has(svg[class$=minusIcon])'
    );

    await expectConfirmModalAndAct(page, { title: 'Reminder', actionText: 'Delete' });

    await expectToSaveChanges(page);

    await waitForToast(page, { text: 'Saved' });

    // Wait for the redirect uri field to be updated
    await page.waitForTimeout(500);

    // Remove Redirect Uri
    await expect(page).toFill(`input[value="${testApp.redirectUri}"]`, '');

    await expectToSaveChanges(page);

    // Expect error
    await expect(page).toMatchElement(
      'div[class$=field] div[class$=multilineInput] div[class$=error]',
      {
        text: 'You must enter at least one redirect URI',
      }
    );

    await expectToDiscardChanges(page);

    await expectToProceedAppDeletion(page, testApp.name);

    expect(page.url()).toBe(new URL('/console/applications', logtoConsoleUrl).href);
  });

  it.each(applicationTypesMetadata)(
    'can create and modify a(n) $type application without framework',
    async (app: ApplicationMetadata) => {
      if (app.type === ApplicationType.Protected) {
        // TODO @wangsijie: Remove this guard once protected app is ready
        expect(true).toBe(true);
        return;
      }

      await expect(page).toClick('div[class$=main] div[class$=headline] button span', {
        text: 'Create application',
      });

      await expect(page).toClick('.ReactModalPortal nav[class$=actionBar] button span', {
        text: 'Create app without framework',
      });

      await expectModalWithTitle(page, 'Create application');

      await expect(page).toClick(`div[class*=radio][role=radio]:has(input[value=${app.type}])`);

      await expect(page).toFillForm('.ReactModalPortal form', {
        name: app.name,
        description: app.description,
      });
      await expectToClickModalAction(page, 'Create application');

      await waitForToast(page, { text: 'Application created successfully.' });

      await expect(page).toMatchElement('div[class$=main] div[class$=header] div[class$=name]', {
        text: app.name,
      });

      await expectToProceedAppDeletion(page, app.name);

      expect(page.url()).toBe(new URL('/console/applications', logtoConsoleUrl).href);
    }
  );

  it('delete the initial application', async () => {
    await expect(page).toClick('table tbody tr td div[class$=item] a[class$=title]', {
      text: initialApp.name,
    });

    await expect(page).toMatchElement('div[class$=main] div[class$=header] div[class$=name]', {
      text: initialApp.name,
    });

    await expectToProceedAppDeletion(page, initialApp.name);

    expect(page.url()).toBe(new URL('/console/applications', logtoConsoleUrl).href);
  });

  it('can create an third party application', async () => {
    await expect(page).toClick('div[class$=main] div[class$=headline] button span', {
      text: 'Create application',
    });

    await expectModalWithTitle(page, 'Start with SDK and guides');

    await expectFrameworksInGroup(page, '.ReactModalPortal div[class$=guideGroup]:has(>label)');

    // Expect the framework contains on the page
    await expectFrameworkExists(page, thirdPartyApp.framework);

    // Filter
    await expect(page).toFill('div[class$=searchInput] input', thirdPartyApp.framework);

    // Expect the framework exists after filtering
    await expectFrameworkExists(page, thirdPartyApp.framework);

    await expectToChooseAndClickApplicationFramework(page, thirdPartyApp.framework);

    // Expect the app can be created successfully
    await expectToProceedApplicationCreationFrom(page, thirdPartyApp);

    await expect(page).toMatchElement('div[class$=main] div[class$=header] div[class$=name]', {
      text: thirdPartyApp.name,
    });

    await expectToProceedAppDeletion(page, thirdPartyApp.name);

    expect(page.url()).toBe(new URL('/console/applications', logtoConsoleUrl).href);
  });
});
