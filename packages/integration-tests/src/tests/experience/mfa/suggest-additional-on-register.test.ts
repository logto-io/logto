import { ConnectorType } from '@logto/connector-kit';
import { MfaFactor, MfaPolicy, SignInIdentifier } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import { resetMfaSettings } from '#src/helpers/sign-in-experience.js';
import ExpectMfaExperience from '#src/ui-helpers/expect-mfa-experience.js';
import ExpectTotpExperience from '#src/ui-helpers/expect-totp-experience.js';
import { devFeatureTest, generateEmail } from '#src/utils.js';

devFeatureTest.describe('Experience - suggest additional MFA after email registration', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email]);
    await setEmailConnector();
    await updateSignInExperience({
      signUp: {
        identifiers: [SignInIdentifier.Email],
        password: true,
        verify: true,
      },
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Email,
            password: true,
            verificationCode: false,
            isPasswordPrimary: false,
          },
        ],
      },
      forgotPasswordMethods: [],
    });
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email]);
  });

  afterEach(async () => {
    await resetMfaSettings();
  });

  it('navigates to optional mfa-binding and can skip', async () => {
    await updateSignInExperience({
      mfa: {
        factors: [MfaFactor.EmailVerificationCode, MfaFactor.TOTP],
        policy: MfaPolicy.Mandatory,
      },
    });

    const email = generateEmail();
    const password = 'l0gt0_T3st_P@ssw0rd';

    const experience = new ExpectMfaExperience(await browser.newPage());

    // Start register flow with email identifier
    await experience.startWith(demoAppUrl, 'register');
    await experience.toFillInput('identifier', email, { submit: true });
    await experience.toCompleteVerification('register', ConnectorType.Email);

    // Wait for navigation to password page after verifying code (continue flow)
    await experience.waitForPathname('continue/password');
    await experience.toFillNewPasswords(password);

    // Wait for suggestion navigation and page render (list page)
    await experience.waitForPathname('mfa-binding/Totp');

    // Skip optional suggestion
    await experience.toClick('div[role=button][class$=skipButton]');
    await experience.page.waitForNetworkIdle();

    const userId = await experience.getUserIdFromDemoAppPage();
    await experience.verifyThenEnd();
    await deleteUser(userId);
  });

  it('navigates to optional mfa-binding, binds TOTP and continues', async () => {
    await updateSignInExperience({
      mfa: {
        factors: [MfaFactor.EmailVerificationCode, MfaFactor.TOTP],
        policy: MfaPolicy.Mandatory,
      },
    });
    const email = generateEmail();
    const password = 'l0gt0_T3st_P@ssw0rd';

    const experience = new ExpectTotpExperience(await browser.newPage());

    // Start register flow with email identifier
    await experience.startWith(demoAppUrl, 'register');
    await experience.toFillInput('identifier', email, { submit: true });
    await experience.toCompleteVerification('register', ConnectorType.Email);

    // Continue to set password
    await experience.waitForPathname('continue/password');
    await experience.toFillNewPasswords(password);

    // Land on optional MFA suggestion list
    await experience.waitForPathname('mfa-binding/Totp');
    await experience.toBindTotp();
    const userId = await experience.getUserIdFromDemoAppPage();
    await experience.verifyThenEnd();
    await deleteUser(userId);
  });

  it('when Email, TOTP and Backup Code are available: skipping TOTP suggestion requires Backup Code', async () => {
    await updateSignInExperience({
      mfa: {
        factors: [MfaFactor.EmailVerificationCode, MfaFactor.TOTP, MfaFactor.BackupCode],
        policy: MfaPolicy.Mandatory,
      },
    });

    const email = generateEmail();
    const password = 'l0gt0_T3st_P@ssw0rd';

    const experience = new ExpectMfaExperience(await browser.newPage());

    // Start register with email
    await experience.startWith(demoAppUrl, 'register');
    await experience.toFillInput('identifier', email, { submit: true });
    await experience.toCompleteVerification('register', ConnectorType.Email);

    // Set password
    await experience.waitForPathname('continue/password');
    await experience.toFillNewPasswords(password);

    // Optional suggestion detail page for TOTP
    await experience.waitForPathname('mfa-binding/Totp');

    // Click skip for optional suggestion; backend should require backup code
    await experience.toClick('div[role=button][class$=skipButton]');
    await experience.waitForPathname('mfa-binding/BackupCode');

    // Backup codes page
    await experience.retrieveBackupCodes();
    await experience.toClick('button', 'Continue');

    const userId = await experience.getUserIdFromDemoAppPage();
    await experience.verifyThenEnd();
    await deleteUser(userId);
  });
});
