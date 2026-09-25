import { type Color, Theme } from '@logto/schemas';

import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import ExpectExperience from '#src/ui-helpers/expect-experience.js';
import { devFeatureTest } from '#src/utils.js';

/**
 * Load the demo app with the given `theme` search param (forwarded to the authentication request
 * as an extra param) and report the theme the experience app actually rendered with.
 */
const getRenderedTheme = async (
  theme: string | undefined,
  systemPrefers: 'light' | 'dark'
): Promise<string | undefined> => {
  const experience = new ExpectExperience(await browser.newPage());
  await experience.page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: systemPrefers },
  ]);

  const url = new URL(demoAppUrl);

  if (theme !== undefined) {
    url.searchParams.set('theme', theme);
  }

  await experience.page.goto(url.href, { waitUntil: 'networkidle0' });
  const rendered = await experience.page.evaluate(
    () => document.documentElement.dataset.theme ?? undefined
  );
  await experience.page.close();

  return rendered;
};

devFeatureTest.describe('theme authentication parameter', () => {
  const color = Object.freeze({
    primaryColor: '#6139f6',
    darkPrimaryColor: '#8768f8',
    isDarkModeEnabled: true,
  } satisfies Color);

  describe('dark mode enabled', () => {
    beforeAll(async () => {
      await updateSignInExperience({ color: { ...color, isDarkModeEnabled: true } });
    });

    it('should render dark when the parameter asks for it against a light system setting', async () => {
      await expect(getRenderedTheme(Theme.Dark, 'light')).resolves.toBe(Theme.Dark);
    });

    it('should render light when the parameter asks for it against a dark system setting', async () => {
      await expect(getRenderedTheme(Theme.Light, 'dark')).resolves.toBe(Theme.Light);
    });

    it('should fall back to the system setting without the parameter', async () => {
      await expect(getRenderedTheme(undefined, 'dark')).resolves.toBe(Theme.Dark);
    });

    it('should ignore an unsupported parameter value', async () => {
      await expect(getRenderedTheme('sepia', 'dark')).resolves.toBe(Theme.Dark);
    });
  });

  describe('dark mode disabled', () => {
    beforeAll(async () => {
      await updateSignInExperience({ color: { ...color, isDarkModeEnabled: false } });
    });

    it('should ignore the parameter', async () => {
      await expect(getRenderedTheme(Theme.Dark, 'dark')).resolves.toBe(Theme.Light);
    });
  });
});
