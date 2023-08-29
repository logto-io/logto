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

import { type ApplicationCase, initialApp, testAppCases } from './application-test-cases.js';
import {
  expectFrameworkExists,
  expectToClickFramework,
  expectToProceedCreationFrom,
  expectToProceedSdkGuide,
  expectToProceedAppDeletion,
} from './helpers.js';
import {
  type TypedApplicationCase,
  typedApplicationCases,
} from './typed-application-test-cases.js';

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

  it('create the initial application from the table placeholder', async () => {
    // Expect to see the placeholder
    await expect(page).toMatchElement(
      'div[class$=guideLibraryContainer] div[class$=titleEllipsis]',
      { text: 'Select a framework or tutorial', timeout: 2000 }
    );

    await expectToClickFramework(page, initialApp.framework);

    await expectToProceedCreationFrom(page, initialApp);

    await expectToProceedSdkGuide(page, initialApp, true);

    // Details page
    await expect(page).toMatchElement('div[class$=main] div[class$=header] div[class$=name]', {
      text: initialApp.name,
    });

    // Back to application list page
    await expectNavigation(
      expect(page).toClick('div[class$=main] a[class$=backLink]', {
        text: 'Back to Applications',
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
      text: 'Create Application',
    });

    await expectModalWithTitle(page, 'Start with SDK and guides');

    await expect(page).toClick(
      '.ReactModalPortal div[class$=header] button[class$=requestSdkButton] span',
      {
        text: "Can't find your guide?",
      }
    );

    await expectToOpenNewPage(browser, 'https://github.com/logto-io/logto/issues');

    // Return to the application list page
    await expectNavigation(
      expect(page).toClick('.ReactModalPortal div[class$=header] button:has(svg[class$=closeIcon])')
    );

    expect(page.url()).toBe(new URL('/console/applications', logtoConsoleUrl).href);
  });

  it.each(testAppCases)(
    'can create and modify a(n) $framework application by framework',
    async (app: ApplicationCase) => {
      await expect(page).toClick('div[class$=main] div[class$=headline] button span', {
        text: 'Create Application',
      });

      // Expect the framework contains on the page
      await expectFrameworkExists(page, app.framework);

      // Filter
      await expect(page).toFill('div[class$=searchInput] input', app.framework);

      // Expect the framework exists after filtering
      await expectFrameworkExists(page, app.framework);

      await expectToClickFramework(page, app.framework);

      await expectToProceedCreationFrom(page, app);

      await expectToProceedSdkGuide(page, app);

      // Expect on the details page
      await expect(page).toMatchElement('div[class$=main] div[class$=header] div[class$=name]', {
        text: app.name,
      });

      // Check guide
      await expect(page).toClick('div[class$=header] button span', { text: 'Check Guide' });

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
        description: `(New): ${app.description}`,
      });

      await expectUnsavedChangesAlert(page);

      await expectToSaveChanges(page);
      await waitForToast(page, { text: 'Saved' });

      if (app.redirectUri) {
        const redirectUriFiled = await expect(page).toMatchElement(
          'div[class$=field]:has(>div[class$=headline]>div[class$=title]',
          { text: 'Redirect URIs' }
        );

        // Add and remove redirect uri
        await expect(redirectUriFiled).toClick('div[class$=multilineInput]>button>span', {
          text: 'Add Another',
        });

        // Wait for the new redirect uri field
        await page.waitForSelector(
          'div:has(>div[class$=deletableInput]):last-of-type button:has(svg[class$=minusIcon])'
        );

        await expect(redirectUriFiled).toFill(
          'div:has(>div[class$=deletableInput]):last-of-type input',
          `${app.redirectUri}/v2`
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
        await expect(page).toFill(`input[value="${app.redirectUri}"]`, '');

        await expectToSaveChanges(page);

        // Expect error
        await expect(page).toMatchElement(
          'div[class$=field] div[class$=multilineInput] div[class$=error]',
          {
            text: 'You must enter at least one redirect URI',
          }
        );

        await expectToDiscardChanges(page);
      }

      await expectToProceedAppDeletion(page, app.name);

      expect(page.url()).toBe(new URL('/console/applications', logtoConsoleUrl).href);
    }
  );

  it.each(typedApplicationCases)(
    'can create and modify a(n) $type application without framework',
    async (app: TypedApplicationCase) => {
      await expect(page).toClick('div[class$=main] div[class$=headline] button span', {
        text: 'Create Application',
      });

      await expect(page).toClick('.ReactModalPortal nav[class$=actionBar] button span', {
        text: 'Create app without framework',
      });

      await expectModalWithTitle(page, 'Create Application');

      await expect(page).toClick(`div[class*=radio][role=radio]:has(input[value=${app.type}])`);

      await expect(page).toFillForm('.ReactModalPortal form', {
        name: app.name,
        description: app.description,
      });
      await expectToClickModalAction(page, 'Create Application');

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
});
