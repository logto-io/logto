import { type Nullable } from '@silverhand/essentials';
import { type Page, type Target } from 'puppeteer';

import { logtoConsoleUrl as logtoConsoleUrlString, logtoUrl } from '#src/constants.js';
import { goToAdminConsole } from '#src/ui-helpers/index.js';
import { expectNavigation, appendPathname } from '#src/utils.js';

import { expectToSelectPreviewLanguage, waitForFormCard } from './helpers.js';

await page.setViewport({ width: 1920, height: 1080 });

describe('sign-in experience: sign-in preview', () => {
  const logtoConsoleUrl = new URL(logtoConsoleUrlString);

  beforeAll(async () => {
    await goToAdminConsole();
  });

  it('navigate to sign-in experience page', async () => {
    await expectNavigation(
      page.goto(appendPathname('/console/sign-in-experience', logtoConsoleUrl).href)
    );

    await expect(page).toMatchElement(
      'div[class$=main] div[class$=container] div[class$=cardTitle] div[class$=titleEllipsis]',
      {
        text: 'Sign-in & account',
      }
    );

    // Land on branding tab by default
    expect(page.url()).toBe(new URL(`console/sign-in-experience/branding`, logtoConsoleUrl).href);

    // Wait for the branding tab to load
    await waitForFormCard(page, 'BRANDING AREA');
    await waitForFormCard(page, 'Custom CSS');
  });

  it('switch between preview platforms', async () => {
    // Mobile
    await expect(page).toClick('div[class$=preview] nav a', {
      text: 'Mobile',
    });
    await expect(page).toMatchElement('div[class$=preview] div[class*=preview][class*=mobile]');

    // Desktop
    await expect(page).toClick('div[class$=preview] nav a', {
      text: 'Desktop',
    });
    await expect(page).toMatchElement('div[class$=preview] div[class*=preview][class*=web]');
  });

  it('switch between theme modes', async () => {
    // Enable dark mode
    await expect(page).toClick(
      'form div[class$=field] label[class$=switch]:has(input[name="color.isDarkModeEnabled"])'
    );

    await page.evaluate(() => {
      return document.querySelector<HTMLInputElement>(
        'form div[class$=field] input[name="color.isDarkModeEnabled"]'
      )?.checked;
    });

    // Switch to dark mode
    await expect(page).toClick(
      'div[class$=preview] div[class$=header] div[class$=selects] button:first-of-type'
    );
    await expect(page).toMatchElement(
      'div[class$=preview] div[class$=deviceWrapper] div[class*=device][class*=dark]'
    );

    // Switch to light mode
    await expect(page).toClick(
      'div[class$=preview] div[class$=header] div[class$=selects] button:first-of-type'
    );
    await expect(page).toMatchElement(
      'div[class$=preview] div[class$=deviceWrapper] div[class*=device][class*=light]'
    );

    // Reset
    await expect(page).toClick(
      'form div[class$=field] label[class$=switch]:has(input[name="color.isDarkModeEnabled"])'
    );
  });

  it('switch between preview languages', async () => {
    // Switch to Deutsch
    await expectToSelectPreviewLanguage(page, 'Deutsch');

    // Switch to English
    await expectToSelectPreviewLanguage(page, 'English');
  });

  it('check the live preview', async () => {
    const livePreviewPagePromise = new Promise<Nullable<Page>>((resolve) => {
      browser.once('targetcreated', (target: Target) => {
        resolve(target.page());
      });
    });

    await expect(page).toClick('div[class$=preview] div[class$=header] button span', {
      text: 'Live preview',
    });

    const livePreviewPage = await livePreviewPagePromise;
    expect(livePreviewPage?.url()).toBe(appendPathname('/demo-app', new URL(logtoUrl)).href);

    await livePreviewPage?.close();
  });
});
