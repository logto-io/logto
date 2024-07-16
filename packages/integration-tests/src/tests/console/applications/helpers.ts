import { appendPath } from '@silverhand/essentials';
import { type Page } from 'puppeteer';

import {
  expectModalWithTitle,
  expectToClickDetailsPageOption,
  expectToClickModalAction,
  expectToOpenNewPage,
  waitForToast,
} from '#src/ui-helpers/index.js';
import { expectNavigation } from '#src/utils.js';

import { frameworkGroupLabels, type ApplicationCase } from './constants.js';

export const expectFrameworksInGroup = async (
  page: Page,
  groupSelector: string,
  isTablePlaceHolder = false
) => {
  /* eslint-disable no-await-in-loop */
  // Expect the framework group to be visible, Third-party and Machine-to-machine are not visible in table placeholder
  for (const groupLabel of isTablePlaceHolder
    ? frameworkGroupLabels.filter(
        (label) => label !== 'Third-party' && label !== 'Machine-to-machine'
      )
    : frameworkGroupLabels) {
    const frameGroup = await expect(page).toMatchElement(groupSelector, {
      text: groupLabel,
    });

    const frameworks = await frameGroup.$$('div[class$=grid] div[class*=card]');
    expect(frameworks.length).toBeGreaterThan(0);
  }
  /* eslint-enable no-await-in-loop */
};

export const expectToChooseAndClickApplicationFramework = async (page: Page, framework: string) => {
  const frameworkCard = await expect(page).toMatchElement(
    'div[class*=card]:has(div[class$=header] div[class$=name])',
    {
      text: framework,
    }
  );

  await expect(frameworkCard).toClick('button span', { text: 'Start building' });
};

export const expectFrameworkExists = async (page: Page, framework: string) => {
  await expect(page).toMatchElement('div[class*=card]:has(div[class$=header] div[class$=name])', {
    text: framework,
  });
};

export const expectToProceedApplicationCreationFrom = async (
  page: Page,
  { name, description }: { name: string; description: string }
) => {
  // Expect the creation form to be open
  await expectModalWithTitle(page, 'Create application');

  await expect(page).toFillForm('.ReactModalPortal form', {
    name,
    description,
  });
  await expectToClickModalAction(page, 'Create application');

  await waitForToast(page, { text: 'Application created successfully.' });
};

export const expectToProceedSdkGuide = async (
  page: Page,
  { guideFilename, sample, redirectUri, postSignOutRedirectUri }: ApplicationCase,
  skipFillForm = false
) => {
  await expectModalWithTitle(page, 'Start with SDK and guides');

  expect(page.url()).toContain(`/guide/${guideFilename}`);

  await expect(page).toClick('.ReactModalPortal aside[class$=sample] a span', {
    text: 'Check out sample',
  });

  await expectToOpenNewPage(
    browser,
    appendPath(new URL('https://github.com/logto-io'), sample.repo, 'tree/HEAD', sample.path).href
  );

  if (!skipFillForm) {
    const redirectUriFieldWrapper = await expect(page).toMatchElement(
      'div[class$=wrapper]:has(>div[class$=field]>div[class$=headline]>div[class$=title])',
      { text: 'Redirect URI' }
    );

    await expect(redirectUriFieldWrapper).toFill('input', redirectUri);

    await expect(redirectUriFieldWrapper).toClick('button span', { text: 'Save' });

    await waitForToast(page, { text: 'Saved' });

    const postSignOutRedirectUriWrapper = await expect(page).toMatchElement(
      'div[class$=wrapper]:has(>div[class$=field]>div[class$=headline]>div[class$=title])',
      { text: 'Post sign-out redirect URI' }
    );

    await expect(postSignOutRedirectUriWrapper).toFill('input', postSignOutRedirectUri);

    await expect(postSignOutRedirectUriWrapper).toClick('button span', { text: 'Save' });

    await waitForToast(page, { text: 'Saved' });
  }

  // Finish guide
  await expect(page).toClick('.ReactModalPortal nav[class$=actionBar] button span', {
    text: 'Finish and done',
  });
};

export const expectToProceedAppDeletion = async (page: Page, appName: string) => {
  // Delete the application
  await expectToClickDetailsPageOption(page, 'Delete');

  // Confirm deletion
  await expectModalWithTitle(page, 'Reminder');

  await expect(page).toFill('.ReactModalPortal div[class$=deleteConfirm] input', appName);

  await expectNavigation(expectToClickModalAction(page, 'Delete'));

  await waitForToast(page, {
    text: `Application ${appName} has been successfully deleted`,
  });
};
