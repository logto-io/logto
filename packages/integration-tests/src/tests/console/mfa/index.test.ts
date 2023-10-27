import { logtoConsoleUrl } from '#src/constants.js';
import {
  expectMainPageWithTitle,
  expectToClickSidebarMenu,
  expectToSaveChanges,
  goToAdminConsole,
  waitForToast,
} from '#src/ui-helpers/index.js';

import {
  expectBackupCodeSetupError,
  expectToClickFactor,
  expectToClickPolicyOption,
} from './helpers.js';

await page.setViewport({ width: 1920, height: 1080 });

// Skip this test suite since it's not public yet
describe.skip('multi-factor authentication', () => {
  beforeAll(async () => {
    await goToAdminConsole();
  });

  it('navigate to multi-factor authentication page', async () => {
    await expectToClickSidebarMenu(page, 'Multi-factor auth');
    await expectMainPageWithTitle(page, 'Multi-factor authentication');
    expect(page.url()).toBe(new URL(`console/mfa`, new URL(logtoConsoleUrl)).href);
  });

  it('should be able to update multi-factors', async () => {
    // Cannot enable backup code alone
    await expectToClickFactor(page, 'backupCodeEnabled');
    await expectBackupCodeSetupError(page);

    // Enable webAuthn
    await expectToClickFactor(page, 'webAuthnEnabled');

    // The backup code error should disappear
    await expect(expectBackupCodeSetupError(page)).rejects.toThrow();
    await expectToSaveChanges(page);
    await waitForToast(page, { text: 'Saved' });

    // Enable totp
    await expectToClickFactor(page, 'totpEnabled');
    await expectToSaveChanges(page);
    await waitForToast(page, { text: 'Saved' });
  });

  it('should be able to update policy', async () => {
    await expect(page).toClick('form div[role=radio]:has(input[name=policy][value=Mandatory])');
    await expectToClickPolicyOption(page, 'Mandatory');
    await expectToSaveChanges(page);
    await waitForToast(page, { text: 'Saved' });
  });

  it('reset mfa settings', async () => {
    await expectToClickPolicyOption(page, 'UserControlled');
    await expectToClickFactor(page, 'backupCodeEnabled');
    await expectToClickFactor(page, 'webAuthnEnabled');
    await expectToClickFactor(page, 'totpEnabled');
    await expectToSaveChanges(page);
    await waitForToast(page, { text: 'Saved' });
  });
});
