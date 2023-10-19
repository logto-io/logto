import { ConnectorType } from '@logto/connector-kit';
import { SignInIdentifier } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import { clearConnectorsByTypes } from '#src/helpers/connector.js';
import {
  enableMandatoryMfaWithWebAuthnAndBackupCode,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import ExpectBackupCodeExperience from '#src/ui-helpers/expect-backup-code-experience.js';
import { generateUsername, waitFor } from '#src/utils.js';

describe('MFA - Backup Code', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms, ConnectorType.Social]);
    await enableMandatoryMfaWithWebAuthnAndBackupCode();
    await updateSignInExperience({
      signUp: {
        identifiers: [SignInIdentifier.Username],
        password: true,
        verify: false,
      },
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Username,
            password: true,
            verificationCode: false,
            isPasswordPrimary: true,
          },
        ],
      },
    });
  });

  afterAll(async () => {
    await resetMfaSettings();
  });

  const username = generateUsername();
  const password = 'l0gt0_T3st_P@ssw0rd';

  it('should bind backup codes when registering and verify backup codes when signing in', async () => {
    const experience = new ExpectBackupCodeExperience(await browser.newPage());
    await experience.setupVirtualAuthenticator();
    await experience.startWith(demoAppUrl, 'register');
    await experience.toFillInput('identifier', username, { submit: true });
    experience.toBeAt('register/password');
    await experience.toFillNewPasswords(password);
    experience.toBeAt('mfa-binding/WebAuthn');
    await experience.toClick('button', 'Create a passkey');

    // Backup codes page
    const backupCodes = await experience.retrieveBackupCodes();
    await experience.toClick('button', 'Continue');

    const userId = await experience.getUserIdFromDemoAppPage();
    await experience.verifyThenEnd(false);

    // Verify by backup codes
    await experience.startWith(demoAppUrl, 'sign-in');
    await experience.toFillForm(
      {
        identifier: username,
        password,
      },
      { submit: true }
    );
    // Wait for the page to process submitting request.
    await waitFor(500);
    experience.toBeAt('mfa-verification');
    await experience.toClick('button', 'Backup code');
    experience.toBeAt('mfa-verification/BackupCode');
    await experience.toFillInput('code', backupCodes.at(0) ?? '', { submit: true });

    await experience.clearVirtualAuthenticator();
    await experience.verifyThenEnd();
    await deleteUser(userId);
  });
});
