import { logtoConsoleUrl as logtoConsoleUrlString } from '#src/constants.js';
import {
  expectToClickNavTab,
  goToAdminConsole,
  expectToSaveChanges,
} from '#src/ui-helpers/index.js';
import { expectNavigation, appendPathname } from '#src/utils.js';

import { expectToSaveSignInExperience, waitForFormCard } from '../helpers.js';

import {
  expectToDeletePasswordlessConnector,
  expectToSetupPasswordlessConnector,
  testSendgridConnector,
  testTwilioConnector,
} from './connector-setup-helpers.js';
import {
  expectToSelectSignUpIdentifier,
  expectNotificationInField,
  expectSignUpIdentifierSelectorError,
  expectToAddSignInMethod,
  expectSignInMethodError,
  expectErrorsOnNavTab,
  expectToClickSignUpAuthnOption,
  expectToClickSignInMethodAuthnOption,
  expectToResetSignUpAndSignInConfig,
} from './helpers.js';

await page.setViewport({ width: 1920, height: 1080 });

describe('sign-in experience(sad path): sign-up and sign-in', () => {
  const logtoConsoleUrl = new URL(logtoConsoleUrlString);

  beforeAll(async () => {
    await goToAdminConsole();
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

  describe('cases that no connector is setup', () => {
    describe('email address as sign-up identifier', () => {
      afterAll(async () => {
        await expectToResetSignUpAndSignInConfig(page, false);
      });

      it('should fail to setup email as sign-up identifier', async () => {
        await expectToSelectSignUpIdentifier(page, 'Email address');
        // Disable password settings for sign-up settings
        await expectToClickSignUpAuthnOption(page, 'Create your password');

        await expectNotificationInField(page, {
          field: 'Sign-up identifier',
          content: /No email connector set-up yet./,
        });

        await expectToSaveChanges(page);

        await expectSignUpIdentifierSelectorError(page);

        await expectErrorsOnNavTab(page, {
          tab: 'Sign-up and sign-in',
          error: '1 errors',
        });
      });

      it('should fail to add phone number sign-in method', async () => {
        await expectToAddSignInMethod(page, 'Phone number');
        await expectNotificationInField(page, {
          field: 'Identifier and authentication settings for sign-in',
          content: /No SMS connector set-up yet./,
        });

        await expectToSaveChanges(page);

        await expectSignInMethodError(page, 'Phone number');
        await expectErrorsOnNavTab(page, {
          tab: 'Sign-up and sign-in',
          error: '2 errors',
        });

        // Disable password option for sign-in method
        await expectToClickSignInMethodAuthnOption(page, {
          method: 'Phone number',
          option: 'Password',
        });

        await expectToSaveChanges(page);

        await expectSignInMethodError(page, 'Phone number');
        await expectErrorsOnNavTab(page, {
          tab: 'Sign-up and sign-in',
          error: '2 errors',
        });
      });
    });

    describe('phone number as sign-up identifier', () => {
      afterAll(async () => {
        await expectToResetSignUpAndSignInConfig(page, false);
      });

      it('should fail to setup phone number as sign-up identifier', async () => {
        await expectToSelectSignUpIdentifier(page, 'Phone number');
        // Disable password settings for sign-up settings
        await expectToClickSignUpAuthnOption(page, 'Create your password');

        await expectNotificationInField(page, {
          field: 'Sign-up identifier',
          content: /No SMS connector set-up yet./,
        });

        await expectToSaveChanges(page);

        await expectSignUpIdentifierSelectorError(page);

        await expectErrorsOnNavTab(page, {
          tab: 'Sign-up and sign-in',
          error: '1 errors',
        });
      });

      it('should fail to add email address sign-in method', async () => {
        await expectToAddSignInMethod(page, 'Email address');
        await expectNotificationInField(page, {
          field: 'Identifier and authentication settings for sign-in',
          content: /No email connector set-up yet./,
        });

        await expectToSaveChanges(page);

        await expectSignInMethodError(page, 'Email address');
        await expectErrorsOnNavTab(page, {
          tab: 'Sign-up and sign-in',
          error: '2 errors',
        });

        // Disable password option for sign-in method
        await expectToClickSignInMethodAuthnOption(page, {
          method: 'Email address',
          option: 'Password',
        });

        await expectToSaveChanges(page);

        await expectSignInMethodError(page, 'Email address');
        await expectErrorsOnNavTab(page, {
          tab: 'Sign-up and sign-in',
          error: '2 errors',
        });
      });
    });

    describe('social sign-in', () => {
      it('should display no social connector notification in social sign-in field', async () => {
        await expectNotificationInField(page, {
          field: 'Social sign-in',
          content: /You haven’t set up any social connector yet./,
        });
      });
    });
  });

  describe('cases that only Email connector is setup', () => {
    beforeAll(async () => {
      // Email connector
      await expectToSetupPasswordlessConnector(page, testSendgridConnector);
      // Nav back to sign-in experience page
      await expectNavigation(
        page.goto(
          appendPathname('/console/sign-in-experience/sign-up-and-sign-in', logtoConsoleUrl).href
        )
      );
    });

    afterAll(async () => {
      await expectToDeletePasswordlessConnector(page, testSendgridConnector);
      await expectNavigation(
        page.goto(
          appendPathname('/console/sign-in-experience/sign-up-and-sign-in', logtoConsoleUrl).href
        )
      );
    });

    describe('email address as sign-up identifier', () => {
      afterAll(async () => {
        await expectToResetSignUpAndSignInConfig(page);
      });

      it('should setup email as sign-up identifier', async () => {
        await expectToSelectSignUpIdentifier(page, 'Email address');
        // Disable password settings for sign-up settings
        await expectToClickSignUpAuthnOption(page, 'Create your password');

        await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
      });

      it('should fail to add phone number sign-in method', async () => {
        await expectToAddSignInMethod(page, 'Phone number');
        await expectNotificationInField(page, {
          field: 'Identifier and authentication settings for sign-in',
          content: /No SMS connector set-up yet./,
        });

        await expectToSaveChanges(page);

        await expectSignInMethodError(page, 'Phone number');
        await expectErrorsOnNavTab(page, {
          tab: 'Sign-up and sign-in',
          error: '1 errors',
        });

        // Disable password option for sign-in method
        await expectToClickSignInMethodAuthnOption(page, {
          method: 'Phone number',
          option: 'Password',
        });

        await expectToSaveChanges(page);

        await expectSignInMethodError(page, 'Phone number');
        await expectErrorsOnNavTab(page, {
          tab: 'Sign-up and sign-in',
          error: '1 errors',
        });
      });
    });
  });

  describe('cases that only SMS connector is setup', () => {
    beforeAll(async () => {
      // SMS connector
      await expectToSetupPasswordlessConnector(page, testTwilioConnector);
      // Nav back to sign-in experience page
      await expectNavigation(
        page.goto(
          appendPathname('/console/sign-in-experience/sign-up-and-sign-in', logtoConsoleUrl).href
        )
      );
    });

    afterAll(async () => {
      await expectToDeletePasswordlessConnector(page, testTwilioConnector);
      await expectNavigation(
        page.goto(
          appendPathname('/console/sign-in-experience/sign-up-and-sign-in', logtoConsoleUrl).href
        )
      );
    });

    describe('phone number as sign-up identifier', () => {
      afterAll(async () => {
        await expectToResetSignUpAndSignInConfig(page);
      });

      it('should setup phone number as sign-up identifier', async () => {
        await expectToSelectSignUpIdentifier(page, 'Phone number');
        // Disable password settings for sign-up settings
        await expectToClickSignUpAuthnOption(page, 'Create your password');
        await expectToSaveSignInExperience(page, { needToConfirmChanges: true });
      });

      it('should fail to add email sign-in method', async () => {
        await expectToAddSignInMethod(page, 'Email address');
        await expectNotificationInField(page, {
          field: 'Identifier and authentication settings for sign-in',
          content: /No email connector set-up yet./,
        });

        await expectToSaveChanges(page);

        await expectSignInMethodError(page, 'Email address');
        await expectErrorsOnNavTab(page, {
          tab: 'Sign-up and sign-in',
          error: '1 errors',
        });

        // Disable password option for sign-in method
        await expectToClickSignInMethodAuthnOption(page, {
          method: 'Email address',
          option: 'Password',
        });

        await expectToSaveChanges(page);

        await expectSignInMethodError(page, 'Email address');
        await expectErrorsOnNavTab(page, {
          tab: 'Sign-up and sign-in',
          error: '1 errors',
        });
      });
    });
  });
});
