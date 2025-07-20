import { demoAppUrl } from '#src/constants.js';
import ExpectExperience from '#src/ui-helpers/expect-experience.js';
import { setupUsernameAndEmailExperience } from '#src/ui-helpers/index.js';

describe('basic sentinel', () => {
  beforeAll(async () => {
    await setupUsernameAndEmailExperience(
      undefined,
      /**
       * The default policy settings is way too big for the test.
       * We need to override it to make the test.
       * Update the sign-in experience to use the legacy policy settings:
       *
       * - maxAttempts: 5
       * - lockoutDuration: 10 minutes
       */
      {
        maxAttempts: 5,
        lockoutDuration: 10,
      }
    );
  });

  it('should block a non-existing identifier after 5 failed attempts in 1 hour', async () => {
    const page = await browser.newPage();
    const experience = new ExpectExperience(page, { forgotPassword: true });
    // Open the demo app and navigate to the sign-in page
    await experience.startWith(demoAppUrl, 'sign-in');
    await experience.toFillInput('identifier', 'nonexisting_username_9', { submit: true });

    // Password tests
    experience.toBeAt('sign-in/password');

    await experience.toFillPasswordsToInputs(
      { inputNames: ['password'], shouldNavigate: false },
      ['1', 'account or password'],
      ['2', 'account or password'],
      ['3', 'account or password'],
      ['4', 'account or password'],
      '5'
    );

    await experience.waitForToast('Too many attempts');
    await experience.page.reload({ waitUntil: 'networkidle0' });
    await experience.toFillPasswordsToInputs(
      { inputNames: ['password'], shouldNavigate: false },
      '6'
    );
    await experience.waitForToast('Too many attempts');
  });

  it('should block failed attempts from both password and verification code', async () => {
    const page = await browser.newPage();
    const experience = new ExpectExperience(page, { forgotPassword: true });
    // Open the demo app and navigate to the sign-in page
    await experience.startWith(demoAppUrl, 'sign-in');
    await experience.toFillInput('identifier', 'test_basic_sentinel_7@foo.com', { submit: true });
    await experience.toFillPasswordsToInputs(
      { inputNames: ['password'], shouldNavigate: false },
      ['1', 'account or password'],
      ['2', 'account or password'],
      ['3', 'account or password']
    );
    await experience.toClick('a', 'with verification code');
    await experience.toFillVerificationCode('000000');
    await experience.toFillVerificationCode('000000');
    await experience.waitForToast('Too many attempts');
    await experience.page.reload({ waitUntil: 'networkidle0' });
    await experience.toFillVerificationCode('000000');
    await experience.waitForToast('Too many attempts');
  });
});
