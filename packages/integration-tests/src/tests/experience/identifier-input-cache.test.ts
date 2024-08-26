import { ConnectorType } from '@logto/connector-kit';
import { SignInIdentifier, SignInMode } from '@logto/schemas';
import { appendPath } from '@silverhand/essentials';

import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl, logtoUrl } from '#src/constants.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import ExpectExperience from '#src/ui-helpers/expect-experience.js';
import { generateEmail } from '#src/utils.js';

describe('identifier input cache', () => {
  const testEmail = generateEmail();
  // eslint-disable-next-line @silverhand/fp/no-let
  let experience: ExpectExperience;

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();

    await updateSignInExperience({
      signUp: { identifiers: [SignInIdentifier.Username], password: true, verify: false },
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
        ],
      },
      signInMode: SignInMode.SignInAndRegister,
    });

    // eslint-disable-next-line @silverhand/fp/no-mutation
    experience = new ExpectExperience(await browser.newPage());
  });

  it('should be able to cache identifier(email) input on sign-in page', async () => {
    await experience.startWith(demoAppUrl, 'sign-in');
    await experience.toFillInput('identifier', testEmail, { submit: true });
    // The identifier is read from the cache and displayed on the page
    await experience.toMatchElement('div', { text: new RegExp(testEmail) });
    // Nav back, the identifier should still be there
    await experience.toClick('div[role=button][class$=navButton]', /Back/);
    await experience.toMatchElement(`input[name=identifier][value="${testEmail}"]`);
  });

  it('cached identifier(email) should not be apply to register form (only username is allowed)', async () => {
    await experience.toClick('a', 'Create account');
    experience.toMatchUrl(appendPath(new URL(logtoUrl), 'register').href);
    // The input should be empty
    await experience.toMatchElement('input[name=identifier][value=""]');
  });
});
