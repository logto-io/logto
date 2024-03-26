import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import {
  expectModalWithTitle,
  expectToClickModalAction,
  expectToClickNavTab,
  expectToSaveChanges,
  goToAdminConsole,
  waitForToast,
} from '#src/ui-helpers/index.js';
import { expectNavigation, appendPathname } from '#src/utils.js';

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
  expectToAddSignInMethod,
  expectToAddSocialSignInConnector,
  expectToClickSignInMethodAuthnOption,
  expectToClickSignUpAuthnOption,
  expectToRemoveSignInMethod,
  expectToRemoveSocialSignInConnector,
  expectToResetSignUpAndSignInConfig,
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
    await expectToClickNavTab(page, 'Sign-up and sign-in');

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
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
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
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });

      /**
       * Sign-in method
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
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
    });

    it('update sign-in methods', async () => {
      /**
       * Sign-in method
       * - Phone number: verification code + password
       */
      await expectToSwapSignInMethodAuthnOption(page, 'Phone number');
      await expectToSaveSignInExperience(page);

      /**
       * Sign-in method
       * - Phone number: verification code
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Phone number',
        option: 'Password',
      });
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });

      /**
       * Sign-in method
       * - Phone number: verification code
       * - Email address: password + verification code
       */
      await expectToAddSignInMethod(page, 'Email address');
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });

      /**
       * Sign-in method
       * - Phone number: verification code
       * - Email address: verification code
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Email address',
        option: 'Password',
      });
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });

      /**
       * Sign-in method
       * - Phone number: verification code
       * - Email address: verification code
       * - Username: password
       */
      await expectToAddSignInMethod(page, 'Username');
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
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
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
    });

    it('update sign-in methods', async () => {
      /**
       * Sign-in method
       * - Phone number: verification code + password
       */
      await expectToSwapSignInMethodAuthnOption(page, 'Phone number');
      await expectToSaveSignInExperience(page);

      /**
       * Sign-in method
       * - Phone number: password
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Phone number',
        option: 'Verification code',
      });
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });

      /**
       * Sign-in method
       * - Phone number: password
       * - Username: password
       */
      await expectToAddSignInMethod(page, 'Username');
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
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
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
    });

    it('update sign-in method configs', async () => {
      /**
       * Sign-in method
       * - Email address: verification code + password
       * - Phone number: verification code + password
       */
      await expectToSwapSignInMethodAuthnOption(page, 'Email address');
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
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
    });

    it('update sign-in method configs', async () => {
      /**
       * Sign-in method
       * - Email address: verification code + password
       * - Phone number: verification code + password
       */
      await expectToSwapSignInMethodAuthnOption(page, 'Email address');
      await expectToSwapSignInMethodAuthnOption(page, 'Phone number');
      await expectToSaveSignInExperience(page);

      /**
       * Sign-in method
       * - Email address: password
       * - Phone number: verification code + password
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Email address',
        option: 'Verification code',
      });
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
    });
  });

  describe('not applicable as sign-up identifier', () => {
    afterAll(async () => {
      await expectToResetSignUpAndSignInConfig(page);
    });

    it('select not applicable as sign-up identifier', async () => {
      await expectToSelectSignUpIdentifier(
        page,
        'Not applicable(This apply to social only account creation)'
      );
      await expectToRemoveSignInMethod(page, 'Username');
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
    });

    it('update sign-in methods', async () => {
      /**
       * Sign-in method
       * - Email address: password + verification code
       */
      await expectToAddSignInMethod(page, 'Email address', false);
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });

      /**
       * Sign-in method
       * - Email address: password
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Email address',
        option: 'Verification code',
      });
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });

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
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });

      /**
       * Sign-in method
       * - Email address: verification code
       * - Phone number: password verification code
       */
      await expectToAddSignInMethod(page, 'Phone number');
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });

      /**
       * Sign-in method
       * - Email address: verification code
       * - Phone number: password
       */
      await expectToClickSignInMethodAuthnOption(page, {
        method: 'Phone number',
        option: 'Verification code',
      });
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });

      /**
       * Sign-in method
       * - Email address: verification code
       * - Phone number: password
       * - Username: password
       */
      await expectToAddSignInMethod(page, 'Username');
      await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
    });

    it('add social sign-in connector', async () => {
      await expectToAddSocialSignInConnector(page, 'Apple');
      // Should have diffs about social sign-in connector
      await expectToSaveChanges(page);
      await expectModalWithTitle(page, 'Reminder');

      const beforeSection = await expect(page).toMatchElement(
        'div[class$=section]:has(div[class$=title])',
        { text: 'Before' }
      );

      // Ensure no social-related content in the "Before" section. The modal is already visible, so
      // the timeout can be short.
      await expect(beforeSection).not.toMatchElement('div[class$=title]', {
        text: 'Social',
        timeout: 50,
      });

      // Have social content in the after section
      const afterSection = await expect(page).toMatchElement(
        'div[class$=section]:has(div[class$=title])',
        { text: 'After' }
      );
      await expect(afterSection).toMatchElement('div[class$=title]', {
        text: 'Social',
      });

      await expectToClickModalAction(page, 'Confirm');
      await waitForToast(page, { text: 'Saved' });

      // Reset
      await expectToRemoveSocialSignInConnector(page, 'Apple');
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
