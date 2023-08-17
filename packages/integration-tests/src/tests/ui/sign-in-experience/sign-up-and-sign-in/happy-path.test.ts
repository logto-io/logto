import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import { goToAdminConsole } from '#src/ui-helpers/index.js';
import { expectNavigation, appendPathname } from '#src/utils.js';

import { waitForFormCard } from '../helpers.js';

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
  expectToAddSignInMethod,
  expectToAddSocialSignInConnector,
  expectToClickSignInMethodAuthnOption,
  expectToClickSignUpAuthnOption,
  expectToRemoveSignInMethod,
  expectToRemoveSocialSignInConnector,
  expectToResetSignUpAndSignInConfig,
  expectToSaveSignUpAndSignInConfig,
  expectToSelectSignUpIdentifier,
  expectToSwapSignInMethodAuthnOption,
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
    await expect(page).toClick('nav div[class$=item] div[class$=link] a', {
      text: 'Sign-up and Sign-in',
    });

    await waitForFormCard(page, 'SIGN UP');
    await waitForFormCard(page, 'SIGN IN');
    await waitForFormCard(page, 'SOCIAL SIGN-IN');
  });

  describe('email as sign-up identifier (verify only)', () => {
    afterAll(async () => {
      await expectToResetSignUpAndSignInConfig(page);
    });

    it('select email as sign-in method and disable password settings for sign-up', async () => {
      await expectToSelectSignUpIdentifier(page, 'Email address');
      // Disable password settings for sign-up
      await expectToClickSignUpAuthnOption(page, 'Create your password');
      // Username will be added in later tests
      await expectToRemoveSignInMethod(page, 'Username');

      /**
       * Sign-in method
       * - Email address: password + verification code
       */
      await expectToSaveSignUpAndSignInConfig(page);
    });

    it('update email sign-in method', async () => {
      /**
       * Sign-in method
       * - Email address: verification code
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Email address',
        option: 'Password',
      });
      await expectToSaveSignUpAndSignInConfig(page);

      /**
       * Sign-in method
       * - Email address: verification code + password
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Email address',
        option: 'Password',
      });
      await expectToSwapSignInMethodAuthnOption(page, 'Email address');
      await expectToSaveSignUpAndSignInConfig(page);
    });

    it('add username sign-in method', async () => {
      /**
       * Sign-in method
       * - Email address: verification code + password
       * - Username: password
       */
      await expectToAddSignInMethod(page, 'Username');
      await expectToSaveSignUpAndSignInConfig(page);
    });

    it('add & update phone number sign-in method', async () => {
      await expectToAddSignInMethod(page, 'Phone number');
      /**
       * Sign-in method
       * - Email address: verification code + password
       * - Username: password
       * - Phone number: password + verification code
       */
      await expectToSaveSignUpAndSignInConfig(page);

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
      await expectToSaveSignUpAndSignInConfig(page);

      /**
       * Sign-in method
       * - Email address: verification code + password
       * - Phone number: verification code
       */
      await expectToRemoveSignInMethod(page, 'Username');
      await expectToSaveSignUpAndSignInConfig(page);

      /**
       * Sign-in method
       * - Email address: verification code + password
       * - Phone number: password + verification code
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Phone number',
        option: 'Password',
      });
      await expectToSaveSignUpAndSignInConfig(page);
    });
  });

  describe('email as sign-up identifier (password & verify)', () => {
    afterAll(async () => {
      await expectToResetSignUpAndSignInConfig(page);
    });

    it('select email as sign-in method and enable password settings for sign-up', async () => {
      await expectToSelectSignUpIdentifier(page, 'Email address');
      // Username will be added in later tests
      await expectToRemoveSignInMethod(page, 'Username');

      /**
       * Sign-in method
       * - Email address: password + verification code
       */
      await expectToSaveSignUpAndSignInConfig(page);
    });

    it('update email sign-in method', async () => {
      /**
       * Sign-in method
       * - Email address: verification code + password
       */
      // Sign-in method: Email address + verification code + password
      await expectToSwapSignInMethodAuthnOption(page, 'Email address');
      await expectToSaveSignUpAndSignInConfig(page, { needToConfirmChanges: false });

      /**
       * Sign-in method
       * - Email address: password
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Email address',
        option: 'Verification code',
      });
      await expectToSaveSignUpAndSignInConfig(page);
    });

    it('add phone number & username as sign-in method', async () => {
      /**
       * Sign-in method
       * - Email address: password
       * - Phone number: password + verification code
       */
      await expectToAddSignInMethod(page, 'Phone number');
      await expectToSaveSignUpAndSignInConfig(page);

      /**
       * Sign-in method
       * - Email address: password
       * - Phone number: password
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Phone number',
        option: 'Verification code',
      });
      await expectToSaveSignUpAndSignInConfig(page);

      /**
       * Sign-in method
       * - Email address: password
       * - Phone number: password
       * - Username: password
       */
      await expectToAddSignInMethod(page, 'Username');
      await expectToSaveSignUpAndSignInConfig(page);

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
      await expectToSaveSignUpAndSignInConfig(page);
    });
  });

  describe('phone as sign-up identifier (verify only)', () => {
    afterAll(async () => {
      await expectToResetSignUpAndSignInConfig(page);
    });

    it('select email as sign-in method and disable password settings for sign-up', async () => {
      await expectToSelectSignUpIdentifier(page, 'Phone number');
      // Disable password settings for sign-up
      await expectToClickSignUpAuthnOption(page, 'Create your password');
      // Username will be added in later tests
      await expectToRemoveSignInMethod(page, 'Username');

      /**
       * Sign-in method
       * - Phone number: password + verification code
       */
      await expectToSaveSignUpAndSignInConfig(page);
    });

    it('update sign-in methods', async () => {
      /**
       * Sign-in method
       * - Phone number: verification code + password
       */
      await expectToSwapSignInMethodAuthnOption(page, 'Phone number');
      await expectToSaveSignUpAndSignInConfig(page, { needToConfirmChanges: false });

      /**
       * Sign-in method
       * - Phone number: verification code
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Phone number',
        option: 'Password',
      });
      await expectToSaveSignUpAndSignInConfig(page);

      /**
       * Sign-in method
       * - Phone number: verification code
       * - Email address: password + verification code
       */
      await expectToAddSignInMethod(page, 'Email address');
      await expectToSaveSignUpAndSignInConfig(page);

      /**
       * Sign-in method
       * - Phone number: verification code
       * - Email address: verification code
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Email address',
        option: 'Password',
      });
      await expectToSaveSignUpAndSignInConfig(page);

      /**
       * Sign-in method
       * - Phone number: verification code
       * - Email address: verification code
       * - Username: password
       */
      await expectToAddSignInMethod(page, 'Username');
      await expectToSaveSignUpAndSignInConfig(page);
    });
  });

  describe('phone as sign-up identifier (password & verify)', () => {
    afterAll(async () => {
      await expectToResetSignUpAndSignInConfig(page);
    });

    it('select email as sign-in method and enable password settings for sign-up', async () => {
      await expectToSelectSignUpIdentifier(page, 'Phone number');
      // Username will be added in later tests
      await expectToRemoveSignInMethod(page, 'Username');

      /**
       * Sign-in method
       * - Phone number: password + verification code
       */
      await expectToSaveSignUpAndSignInConfig(page);
    });

    it('update sign-in methods', async () => {
      /**
       * Sign-in method
       * - Phone number: verification code + password
       */
      await expectToSwapSignInMethodAuthnOption(page, 'Phone number');
      await expectToSaveSignUpAndSignInConfig(page, { needToConfirmChanges: false });

      /**
       * Sign-in method
       * - Phone number: password
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Phone number',
        option: 'Verification code',
      });
      await expectToSaveSignUpAndSignInConfig(page);

      /**
       * Sign-in method
       * - Phone number: password
       * - Username: password
       */
      await expectToAddSignInMethod(page, 'Username');
      await expectToSaveSignUpAndSignInConfig(page);
    });
  });

  describe('email or phone as sign-up identifier (verify only)', () => {
    afterAll(async () => {
      await expectToResetSignUpAndSignInConfig(page);
    });

    it('select email or phone as sign-up identifier and disable password settings for sign-up', async () => {
      await expectToSelectSignUpIdentifier(page, 'Email address or phone number');
      await expectToClickSignUpAuthnOption(page, 'Create your password');
      // Username will be added in later tests
      await expectToRemoveSignInMethod(page, 'Username');

      /**
       * Sign-in method
       * - Email address: password + verification code
       * - Phone number: password + verification code
       */
      await expectToSaveSignUpAndSignInConfig(page);
    });

    it('update sign-in method configs', async () => {
      /**
       * Sign-in method
       * - Email address: verification code + password
       * - Phone number: verification code + password
       */
      await expectToSwapSignInMethodAuthnOption(page, 'Email address');
      await expectToSwapSignInMethodAuthnOption(page, 'Phone number');
      await expectToSaveSignUpAndSignInConfig(page, { needToConfirmChanges: false });

      /**
       * Sign-in method
       * - Email address: verification code
       * - Phone number: verification code + password
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Email address',
        option: 'Password',
      });
      await expectToSaveSignUpAndSignInConfig(page);

      /**
       * Sign-in method
       * - Email address: verification code
       * - Phone number: verification code
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Phone number',
        option: 'Password',
      });
      await expectToSaveSignUpAndSignInConfig(page);

      /**
       * Sign-in method
       * - Email address: verification code
       * - Phone number: verification code
       * - Username: password
       */
      await expectToAddSignInMethod(page, 'Username');
      await expectToSaveSignUpAndSignInConfig(page);
    });
  });

  describe('email or phone as sign-up identifier (password & verify)', () => {
    afterAll(async () => {
      await expectToResetSignUpAndSignInConfig(page);
    });

    it('select email or phone as sign-up identifier and enable password settings for sign-up', async () => {
      await expectToSelectSignUpIdentifier(page, 'Email address or phone number');
      // Username will be added in later tests
      await expectToRemoveSignInMethod(page, 'Username');

      /**
       * Sign-in method
       * - Email address: password + verification code
       * - Phone number: password + verification code
       */
      await expectToSaveSignUpAndSignInConfig(page);
    });

    it('update sign-in method configs', async () => {
      /**
       * Sign-in method
       * - Email address: verification code + password
       * - Phone number: verification code + password
       */
      await expectToSwapSignInMethodAuthnOption(page, 'Email address');
      await expectToSwapSignInMethodAuthnOption(page, 'Phone number');
      await expectToSaveSignUpAndSignInConfig(page, { needToConfirmChanges: false });

      /**
       * Sign-in method
       * - Email address: password
       * - Phone number: verification code + password
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Email address',
        option: 'Verification code',
      });
      await expectToSaveSignUpAndSignInConfig(page);

      /**
       * Sign-in method
       * - Email address: password
       * - Phone number: password
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Phone number',
        option: 'Verification code',
      });
      await expectToSaveSignUpAndSignInConfig(page);

      /**
       * Sign-in method
       * - Email address: password
       * - Phone number: password
       * - Username: password
       */
      await expectToAddSignInMethod(page, 'Username');
      await expectToSaveSignUpAndSignInConfig(page);
    });
  });

  describe('not applicable as sign-up identifier', () => {
    afterAll(async () => {
      await expectToResetSignUpAndSignInConfig(page);
    });

    it('select not applicable as sign-up identifier', async () => {
      await expectToSelectSignUpIdentifier(page, 'Not applicable');
      await expectToRemoveSignInMethod(page, 'Username');
      await expectToSaveSignUpAndSignInConfig(page);
    });

    it('update sign-in methods', async () => {
      /**
       * Sign-in method
       * - Email address: password + verification code
       */
      await expectToAddSignInMethod(page, 'Email address', false);
      await expectToSaveSignUpAndSignInConfig(page);

      /**
       * Sign-in method
       * - Email address: password
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Email address',
        option: 'Verification code',
      });
      await expectToSaveSignUpAndSignInConfig(page);

      /**
       * Sign-in method
       * - Email address: verification code
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Email address',
        option: 'Verification code',
      });
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Email address',
        option: 'Password',
      });
      await expectToSaveSignUpAndSignInConfig(page);

      /**
       * Sign-in method
       * - Email address: verification code
       * - Phone number: password verification code
       */
      await expectToAddSignInMethod(page, 'Phone number');
      await expectToSaveSignUpAndSignInConfig(page);

      /**
       * Sign-in method
       * - Email address: verification code
       * - Phone number: password
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Phone number',
        option: 'Verification code',
      });
      await expectToSaveSignUpAndSignInConfig(page);

      /**
       * Sign-in method
       * - Email address: verification code
       * - Phone number: password
       * - Username: password
       */
      await expectToAddSignInMethod(page, 'Username');
      await expectToSaveSignUpAndSignInConfig(page);
    });

    it('add social sign-in connector', async () => {
      await expectToAddSocialSignInConnector(page, 'Apple');
      await expectToSaveSignUpAndSignInConfig(page);

      // Reset
      await expectToRemoveSocialSignInConnector(page, 'Apple');
      await expectToSaveSignUpAndSignInConfig(page);
    });
  });
});
