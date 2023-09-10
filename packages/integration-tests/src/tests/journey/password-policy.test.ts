/* Test the sign-in with different password policies. */

import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import ExpectJourney from '#src/page-helpers/expect-journey.js';

describe('password policy during username registration', () => {
  const username = 'usr_password_policy';

  beforeAll(async () => {
    await updateSignInExperience({
      passwordPolicy: {
        length: { min: 8, max: 32 },
        characterTypes: { min: 3 },
        rejects: {
          pwned: true,
          repetitionAndSequence: true,
          userInfo: true,
          words: [username],
        },
      },
    });
  });

  it('should be able to reject passwords that violate the password policy and accept passwords that do not', async () => {
    const journey = new ExpectJourney(await browser.newPage());

    // Open the demo app and navigate to the register page
    await journey.startWith(demoAppUrl, 'register');
    await journey.toFillInput('identifier', username, { submit: true });

    // Simple password tests
    journey.toBeAt('register/password');
    await journey.toFillPasswords(
      ['123', 'minimum length'],
      ['12345678', 'at least 3 types'],
      ['123456aA', 'simple password'],
      ['defghiZ@', 'sequential characters'],
      ['TTTTTT@z', 'repeated characters'],
      [username + 'A', /product context .* personal information/],
      username + 'ABCD'
    );

    // Signed in
    journey.toMatchUrl(demoAppUrl);
  });
});
