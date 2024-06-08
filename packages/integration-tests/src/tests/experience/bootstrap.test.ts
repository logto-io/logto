import { demoAppUrl } from '#src/constants.js';
import { setUsernamePasswordOnly } from '#src/helpers/sign-in-experience.js';
import ExpectExperience from '#src/ui-helpers/expect-experience.js';

const credentials = {
  username: 'test_bootstrap',
  pwnedPassword: 'test_password',
  password: 'test_passWorD_not_PWNED:-)',
};

/**
 * NOTE: This test suite assumes test cases will run sequentially (which is Jest default).
 * Parallel execution will lead to errors.
 */
// Tip: See https://github.com/argos-ci/jest-puppeteer/blob/main/packages/expect-puppeteer/README.md
// for convenient expect methods
describe('smoke testing on the demo app', () => {
  beforeAll(async () => {
    await setUsernamePasswordOnly();
  });

  it('should be able to create a new account with a credential preset', async () => {
    const experience = new ExpectExperience(await browser.newPage());

    // Open the demo app and navigate to the register page
    await experience.startWith(demoAppUrl, 'register');
    await experience.toFillInput('id', credentials.username, { submit: true });

    // Simple password tests
    experience.toBeAt('register/password');
    await experience.toFillNewPasswords(
      [credentials.pwnedPassword, 'simple password'],
      credentials.password
    );

    await experience.verifyThenEnd();
  });
});
