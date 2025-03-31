import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import { expectToClickNavTab, goToAdminConsole } from '#src/ui-helpers/index.js';
import { expectNavigation, appendPathname, waitFor } from '#src/utils.js';

import { expectToSaveSignInExperience, waitForFormCard } from '../helpers.js';

import {
  expectToDeletePasswordlessConnector,
  expectToSetupPasswordlessConnector,
  testSendgridConnector,
  testTwilioConnector,
  expectToSetupSocialConnector,
  testAppleConnector,
  expectToDeleteSocialConnector,
} from './connector-setup-helpers.js';
import {
  cleanUpSignInAndSignUpIdentifiers,
  expectToAddSignInMethod,
  expectToAddSignUpMethod,
  expectToClickSignInMethodAuthnOption,
  expectToClickSignUpAuthnOption,
  expectToRemoveSignInMethod,
  expectToSwapSignInMethodAuthnOption,
  resetSignUpAndSignInConfigToUsernamePassword,
} from './helpers.js';

await page.setViewport({ width: 1920, height: 1080 });

describe('sign-in experience(happy path): sign-up and sign-in', () => {
  const logtoConsoleUrl = new URL(logtoConsoleUrlString);

  beforeAll(async () => {
    await goToAdminConsole();
    // Email connector
    await expectToSetupPasswordlessConnector(page, testSendgridConnector);
    // SMS connector
    await expectToSetupPasswordlessConnector(page, testTwilioConnector);
    // Social connector
    await expectToSetupSocialConnector(page, testAppleConnector);
  });

  afterAll(async () => {
    await expectToDeletePasswordlessConnector(page, testSendgridConnector);
    await expectToDeletePasswordlessConnector(page, testTwilioConnector);
    await expectToDeleteSocialConnector(page, testAppleConnector);
  });

  it('navigate to sign-in experience page', async () => {
    await expectNavigation(
      page.goto(appendPathname('/console/sign-in-experience', logtoConsoleUrl).href)
    );

    // Land on branding tab by default
    expect(page.url()).toBe(new URL(`console/sign-in-experience/branding`, logtoConsoleUrl).href);
  });

  it('navigate to sign-up and sign-in tab', async () => {
    await expectToClickNavTab(page, 'Sign-up and sign-in');

    await waitForFormCard(page, 'SIGN UP');
    await waitForFormCard(page, 'SIGN IN');
    await waitForFormCard(page, 'SOCIAL SIGN-IN');
  });

  describe('email as sign-up identifier', () => {
    beforeAll(async () => {
      await cleanUpSignInAndSignUpIdentifiers(page);
    });

    afterAll(async () => {
      await resetSignUpAndSignInConfigToUsernamePassword(page);
    });

    it('select email as sign-up identifier', async () => {
      await expectToAddSignUpMethod(page, 'Email address', false);
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
    });

    it('update email sign-in method', async () => {
      /**
       * Sign-in method
       * - Toggle off password
       * - Email address: verification code
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Email address',
        option: 'Password',
      });
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });

      /**
       * Sign-in method
       * - Toggle on password
       * - Email address: verification code + password
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Email address',
        option: 'Password',
      });
      await expectToSwapSignInMethodAuthnOption(page, 'Email address');
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
    });

    it('add username sign-in method', async () => {
      /**
       * Sign-in method
       * - Email address: verification code + password
       * - Username: password
       */
      await expectToAddSignInMethod(page, 'Username');
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
    });

    it('add & update phone number sign-in method', async () => {
      await expectToAddSignInMethod(page, 'Phone number');
      /**
       * Sign-in method
       * - Email address: verification code + password
       * - Username: password
       * - Phone number: password + verification code
       */
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });

      /**
       * Sign-in method
       * - Email address: verification code + password
       * - Username: password
       * - Phone number: verification code
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Phone number',
        option: 'Password',
      });
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });

      /**
       * Sign-in method
       * - Email address: verification code + password
       * - Phone number: verification code
       */
      await expectToRemoveSignInMethod(page, 'Username');
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });

      /**
       * Sign-in method
       * - Email address: verification code + password
       * - Phone number: password + verification code
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Phone number',
        option: 'Password',
      });
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
    });
  });

  describe('email as sign-up identifier (password and verify)', () => {
    beforeAll(async () => {
      await cleanUpSignInAndSignUpIdentifiers(page);
    });

    afterAll(async () => {
      await resetSignUpAndSignInConfigToUsernamePassword(page);
    });

    it('select email as sign-up identifier  and enable password settings for sign-up', async () => {
      await expectToAddSignUpMethod(page, 'Email address', false);
      // Enable password settings for sign-up
      await expectToClickSignUpAuthnOption(page, 'Create your password');
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
    });

    it('update email sign-in method', async () => {
      /**
       * Sign-in method
       * - Email address: verification code + password
       */
      // Sign-in method: Email address + verification code + password
      await expectToSwapSignInMethodAuthnOption(page, 'Email address');
      await expectToSaveSignInExperience(page);

      /**
       * Sign-in method
       * - Email address: password
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Email address',
        option: 'Verification code',
      });
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
    });

    it('add phone number & username as sign-in method', async () => {
      /**
       * Sign-in method
       * - Email address: password
       * - Phone number: password + verification code
       */
      await expectToAddSignInMethod(page, 'Phone number');
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });

      /**
       * Sign-in method
       * - Email address: password
       * - Phone number: password
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Phone number',
        option: 'Verification code',
      });
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });

      /**
       * Sign-in method
       * - Email address: password
       * - Phone number: password
       * - Username: password
       */
      await expectToAddSignInMethod(page, 'Username');
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });

      /**
       * Sign-in method
       * - Email address: password
       * - Phone number: password + verification code
       * - Username: password
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Phone number',
        option: 'Verification code',
      });
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
    });
  });

  describe('email or phone as sign-up identifier (verify only', () => {
    beforeAll(async () => {
      await cleanUpSignInAndSignUpIdentifiers(page);
    });
    afterAll(async () => {
      await resetSignUpAndSignInConfigToUsernamePassword(page);
    });

    it('select email or phone as sign-up identifier and disable password settings for sign-up', async () => {
      await expectToAddSignUpMethod(page, 'Email address or phone number', false);
      /**
       * Sign-in method
       * - Email address: password + verification code
       * - Phone number: password + verification code
       */
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
    });

    it('update sign-in method configs', async () => {
      /**
       * Sign-in method
       * - Email address: verification code + password
       * - Phone number: verification code + password
       */
      await expectToSwapSignInMethodAuthnOption(page, 'Email address');
      await waitFor(100);
      await expectToSwapSignInMethodAuthnOption(page, 'Phone number');
      await expectToSaveSignInExperience(page);

      /**
       * Sign-in method
       * - Email address: verification code
       * - Phone number: verification code + password
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Email address',
        option: 'Password',
      });
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });

      /**
       * Sign-in method
       * - Email address: verification code
       * - Phone number: verification code
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Phone number',
        option: 'Password',
      });
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });

      /**
       * Sign-in method
       * - Email address: verification code
       * - Phone number: verification code
       * - Username: password
       */
      await expectToAddSignInMethod(page, 'Username');
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
    });
  });

  describe('email or phone as sign-up identifier (password & verify)', () => {
    beforeAll(async () => {
      await cleanUpSignInAndSignUpIdentifiers(page);
    });
    afterAll(async () => {
      await resetSignUpAndSignInConfigToUsernamePassword(page);
    });

    it('select email or phone as sign-up identifier and enable password settings for sign-up', async () => {
      await expectToAddSignUpMethod(page, 'Email address or phone number', false);
      /**
       * Sign-in method
       * - Email address: password + verification code
       * - Phone number: password + verification code
       */
      await expectToClickSignUpAuthnOption(page, 'Create your password');
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
    });

    it('update sign-in method configs', async () => {
      /**
       * Sign-in method
       * - Email address: verification code + password
       */
      // Sign-in method: Email address + verification code + password
      await expectToSwapSignInMethodAuthnOption(page, 'Email address');
      await waitFor(100);
      await expectToSwapSignInMethodAuthnOption(page, 'Phone number');
      await expectToSaveSignInExperience(page);

      /**
       * Sign-in method
       * - Email address: password
       * - Phone number: password
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Email address',
        option: 'Verification code',
      });
      await waitFor(100);
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Phone number',
        option: 'Verification code',
      });
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });

      /**
       * Sign-in method
       * - Email address: verification code
       * - Phone number: verification code
       * - Username: password
       */
      await expectToAddSignInMethod(page, 'Username');
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
    });
  });

  describe('username and email as sign-up identifier', () => {
    beforeAll(async () => {
      await cleanUpSignInAndSignUpIdentifiers(page);
    });
    afterAll(async () => {
      await resetSignUpAndSignInConfigToUsernamePassword(page);
    });

    it('select username and email as sign-up identifier', async () => {
      await expectToAddSignUpMethod(page, 'Email address', false);
      await expectToAddSignUpMethod(page, 'Username');
      /**
       * Sign-in method
       * - Email address: password + verification code
       * - Username: password
       */
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
    });

    it('update sign-in method configs', async () => {
      /**
       * Sign-in method
       * - Email address: verification code + password
       * - Username: password
       */
      await expectToSwapSignInMethodAuthnOption(page, 'Email address');
      await expectToSaveSignInExperience(page);

      /**
       * Sign-in method
       * - Email address: verification code + password
       */
      await expectToRemoveSignInMethod(page, 'Username');
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
    });
  });

  describe('username and email or phone as sign-up identifier', () => {
    beforeAll(async () => {
      await cleanUpSignInAndSignUpIdentifiers(page);
    });
    afterAll(async () => {
      await resetSignUpAndSignInConfigToUsernamePassword(page);
    });

    it('select username and email or phone as sign-up identifier', async () => {
      await expectToAddSignUpMethod(page, 'Username', false);
      await expectToAddSignUpMethod(page, 'Email address or phone number');
      /**
       * Sign-in method
       * - Email address: password + verification code
       * - Phone number: password + verification code
       * - Username: password
       */
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
    });

    it('update sign-in method configs', async () => {
      /**
       * Sign-in method
       * - Email address: verification code + password
       * - Username: password
       */
      await expectToSwapSignInMethodAuthnOption(page, 'Email address');
      await waitFor(100);
      await expectToSwapSignInMethodAuthnOption(page, 'Phone number');
      await expectToSaveSignInExperience(page);

      /**
       * Sign-in method
       * - Email address: password
       * - Phone number: password
       * - Username: password
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Email address',
        option: 'Verification code',
      });
      await waitFor(100);
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Phone number',
        option: 'Verification code',
      });
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });

      /**
       * Sign-in method
       * - Email address: password
       * - Phone number: password
       */
      await expectToRemoveSignInMethod(page, 'Username');
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
    });
  });

  it('can disable user registration', async () => {
    const switchSelector = 'label[class$=switch]:has(input[name=createAccountEnabled])';
    await expect(page).toClick(switchSelector);
    await expectToSaveSignInExperience(page);

    // Reset
    await expect(page).toClick(switchSelector);
    await expectToSaveSignInExperience(page);
  });
});
