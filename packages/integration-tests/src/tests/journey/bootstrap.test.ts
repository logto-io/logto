import { demoAppUrl } from '#src/constants.js';
import ExpectJourney from '#src/page-helpers/expect-journey.js';

const credentials = {
  username: 'test_username10',
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
  it('should be able to create a new account with a credential preset', async () => {
    const journey = new ExpectJourney(await browser.newPage());

    // Open the demo app and navigate to the register page
    await journey.startWith(demoAppUrl, 'register');
    await journey.toFillInput('identifier', credentials.username, { submit: true });

    // Simple password tests
    journey.toBeAt('register/password');
    await journey.toFillPasswords(
      [credentials.pwnedPassword, 'simple password'],
      credentials.password
    );

    // Signed in
    journey.toMatchUrl(demoAppUrl);
  });
});
