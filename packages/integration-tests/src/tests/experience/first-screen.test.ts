import { ConnectorType } from '@logto/connector-kit';
import { SignInIdentifier } from '@logto/schemas';

import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import ExpectExperience from '#src/ui-helpers/expect-experience.js';
import { devFeatureTest } from '#src/utils.js';

const { describe, it } = devFeatureTest;

describe('first screen', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();
    await setSmsConnector();
  });

  describe('sign-in page', () => {
    it('should be landed on sign-in page directly', async () => {
      const experience = new ExpectExperience(await browser.newPage());
      const url = new URL(demoAppUrl);
      url.searchParams.set('first_screen', 'sign_in');
      await experience.page.goto(url.href, { waitUntil: 'networkidle0' });
      experience.toBeAt('sign-in');
      await experience.page.close();
    });
  });

  describe('register page', () => {
    it('should be landed on register page directly', async () => {
      const experience = new ExpectExperience(await browser.newPage());
      const url = new URL(demoAppUrl);
      url.searchParams.set('first_screen', 'register');
      await experience.page.goto(url.href, { waitUntil: 'networkidle0' });
      experience.toBeAt('register');
      await experience.page.close();
    });
  });

  describe('single sign-on page', () => {
    it('should be landed on single sign-on page directly', async () => {
      const experience = new ExpectExperience(await browser.newPage());
      const url = new URL(demoAppUrl);
      url.searchParams.set('first_screen', 'single_sign_on');
      await experience.page.goto(url.href, { waitUntil: 'networkidle0' });
      experience.toBeAt('single-sign-on');
      await experience.page.close();
    });
  });

  describe('identifier sign-in page', () => {
    // eslint-disable-next-line @silverhand/fp/no-let
    let experience: ExpectExperience;
    // eslint-disable-next-line @silverhand/fp/no-let
    let url: URL;

    beforeEach(async () => {
      // Enable all sign-in methods
      await updateSignInExperience({
        signIn: {
          methods: [
            {
              identifier: SignInIdentifier.Username,
              password: true,
              verificationCode: false,
              isPasswordPrimary: true,
            },
            {
              identifier: SignInIdentifier.Email,
              password: true,
              verificationCode: true,
              isPasswordPrimary: true,
            },
            {
              identifier: SignInIdentifier.Phone,
              password: true,
              verificationCode: true,
              isPasswordPrimary: true,
            },
          ],
        },
      });

      // eslint-disable-next-line @silverhand/fp/no-mutation
      experience = new ExpectExperience(await browser.newPage());
      // eslint-disable-next-line @silverhand/fp/no-mutation
      url = new URL(demoAppUrl);
      url.searchParams.set('first_screen', 'identifier:sign_in');
    });

    afterEach(async () => {
      await experience.page.close();
    });

    it('should render all identifiers', async () => {
      await experience.page.goto(url.href, { waitUntil: 'networkidle0' });
      experience.toBeAt('identifier-sign-in');
      await experience.toMatchElement('label', { text: 'Username / Email / Phone number' });
    });

    it('should render filtered identifiers (Username and Email)', async () => {
      url.searchParams.set(
        'identifier',
        [SignInIdentifier.Username, SignInIdentifier.Email].join(' ')
      );
      await experience.page.goto(url.href, { waitUntil: 'networkidle0' });
      experience.toBeAt('identifier-sign-in');
      await experience.toMatchElement('label', { text: 'Username / Email' });
    });

    it('should render only Email identifier', async () => {
      url.searchParams.set('identifier', SignInIdentifier.Email);
      await experience.page.goto(url.href, { waitUntil: 'networkidle0' });
      experience.toBeAt('identifier-sign-in');
      await experience.toMatchElement('label', { text: 'Email' });
    });

    it('should render filtered identifiers (Email and Phone)', async () => {
      url.searchParams.set(
        'identifier',
        [SignInIdentifier.Email, SignInIdentifier.Phone].join(' ')
      );
      await experience.page.goto(url.href, { waitUntil: 'networkidle0' });
      experience.toBeAt('identifier-sign-in');
      await experience.toMatchElement('label', { text: 'Email / Phone number' });
    });

    it('should fallback to sign-in page if not sign-in methods are enabled', async () => {
      await updateSignInExperience({
        signUp: {
          identifiers: [],
          password: false,
          verify: false,
        },
        signIn: {
          methods: [],
        },
      });
      await experience.page.goto(url.href);
      await experience.page.waitForNetworkIdle();

      experience.toBeAt('sign-in');
    });
  });

  describe('identifier register page', () => {
    // eslint-disable-next-line @silverhand/fp/no-let
    let experience: ExpectExperience;
    // eslint-disable-next-line @silverhand/fp/no-let
    let url: URL;

    beforeEach(async () => {
      await updateSignInExperience({
        signUp: {
          identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
          password: false,
          verify: true,
        },
      });

      // eslint-disable-next-line @silverhand/fp/no-mutation
      experience = new ExpectExperience(await browser.newPage());
      // eslint-disable-next-line @silverhand/fp/no-mutation
      url = new URL(demoAppUrl);
      url.searchParams.set('first_screen', 'identifier:register');
    });

    afterEach(async () => {
      await experience.page.close();
    });

    it('should render all identifiers', async () => {
      await experience.page.goto(url.href, { waitUntil: 'networkidle0' });
      await experience.toMatchElement('label', { text: 'Email / Phone number' });
    });

    it('should render filtered identifier Email', async () => {
      url.searchParams.set('identifier', SignInIdentifier.Email);
      await experience.page.goto(url.href, { waitUntil: 'networkidle0' });
      await experience.toMatchElement('label', { text: 'Email' });
    });

    it('should fallback to sign-in page if not sign-up methods are enabled', async () => {
      await updateSignInExperience({
        signUp: {
          identifiers: [],
          password: false,
          verify: false,
        },
      });

      await experience.page.goto(url.href, { waitUntil: 'networkidle0' });
      experience.toBeAt('sign-in');
    });
  });
});
