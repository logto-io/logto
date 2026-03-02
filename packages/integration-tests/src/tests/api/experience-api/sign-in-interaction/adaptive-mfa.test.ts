import { MfaFactor, MfaPolicy, SignInIdentifier } from '@logto/schemas';
import { authenticator } from 'otplib';

import { createUserMfaVerification } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { initExperienceClient, processSession } from '#src/helpers/client.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import {
  successfullyCreateAndVerifyTotp,
  successfullyVerifyTotp,
} from '#src/helpers/experience/totp-verification.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

const lowBotScoreHeaders = Object.freeze({
  'x-logto-cf-bot-score': '10',
});

devFeatureTest.describe('adaptive MFA enforcement', () => {
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    });
  });

  afterEach(async () => {
    await userApi.cleanUp();
  });

  afterAll(async () => {
    await updateSignInExperience({
      mfa: { policy: MfaPolicy.PromptAtSignInAndSignUp, factors: [] },
      adaptiveMfa: { enabled: false },
    });
  });

  devFeatureTest.describe('with MFA policy + adaptive MFA enabled', () => {
    beforeAll(async () => {
      await updateSignInExperience({
        mfa: {
          factors: [MfaFactor.TOTP, MfaFactor.BackupCode],
          policy: MfaPolicy.PromptAtSignInAndSignUp,
        },
        adaptiveMfa: { enabled: true },
      });
    });

    devFeatureTest.it(
      'should require MFA verification when adaptive MFA triggers (low bot score)',
      async () => {
        const { username, password } = generateNewUserProfile({ username: true, password: true });
        const user = await userApi.create({ username, password });
        await createUserMfaVerification(user.id, MfaFactor.TOTP);

        const client = await initExperienceClient({ extraHeaders: lowBotScoreHeaders });
        await identifyUserWithUsernamePassword(client, username, password);

        await expectRejects(client.submitInteraction(), {
          code: 'session.mfa.require_mfa_verification',
          status: 403,
        });
      }
    );

    devFeatureTest.it(
      'should complete sign-in after MFA verification when adaptive MFA triggers',
      async () => {
        const { username, password } = generateNewUserProfile({ username: true, password: true });
        const user = await userApi.create({ username, password });

        const response = await createUserMfaVerification(user.id, MfaFactor.TOTP);
        await createUserMfaVerification(user.id, MfaFactor.BackupCode);

        if (response.type !== MfaFactor.TOTP) {
          throw new Error('unexpected mfa type');
        }

        const { secret } = response;

        const client = await initExperienceClient({ extraHeaders: lowBotScoreHeaders });
        await identifyUserWithUsernamePassword(client, username, password);

        const code = authenticator.generate(secret);
        await successfullyVerifyTotp(client, { code });

        const { redirectTo } = await client.submitInteraction();
        await processSession(client, redirectTo);
      }
    );

    devFeatureTest.it(
      'should skip MFA verification when adaptive MFA does not trigger (no risk signals)',
      async () => {
        const { username, password } = generateNewUserProfile({ username: true, password: true });
        const user = await userApi.create({ username, password });
        await createUserMfaVerification(user.id, MfaFactor.TOTP);
        await createUserMfaVerification(user.id, MfaFactor.BackupCode);

        const client = await initExperienceClient();
        await identifyUserWithUsernamePassword(client, username, password);

        await expect(client.submitInteraction()).resolves.not.toThrow();
      }
    );
  });

  devFeatureTest.describe('profile update gated by adaptive MFA', () => {
    beforeAll(async () => {
      await updateSignInExperience({
        mfa: {
          factors: [MfaFactor.TOTP, MfaFactor.BackupCode],
          policy: MfaPolicy.PromptAtSignInAndSignUp,
        },
        adaptiveMfa: { enabled: true },
      });
    });

    devFeatureTest.it(
      'should throw 403 on profile update when adaptive MFA triggers and MFA is not verified',
      async () => {
        const { username, password } = generateNewUserProfile({ username: true, password: true });
        const user = await userApi.create({ username, password });
        await createUserMfaVerification(user.id, MfaFactor.TOTP);

        const client = await initExperienceClient({ extraHeaders: lowBotScoreHeaders });
        await identifyUserWithUsernamePassword(client, username, password);

        await expectRejects(
          client.updateProfile({ type: SignInIdentifier.Username, value: 'new_username' }),
          {
            status: 403,
            code: 'session.mfa.require_mfa_verification',
          }
        );
      }
    );

    devFeatureTest.it(
      'should allow profile update when adaptive MFA does not trigger',
      async () => {
        const { username, password } = generateNewUserProfile({ username: true, password: true });
        const user = await userApi.create({ username, password });
        await createUserMfaVerification(user.id, MfaFactor.TOTP);
        await createUserMfaVerification(user.id, MfaFactor.BackupCode);

        const client = await initExperienceClient();
        await identifyUserWithUsernamePassword(client, username, password);

        await expect(client.submitInteraction()).resolves.not.toThrow();
      }
    );
  });

  devFeatureTest.describe('bind MFA gated by adaptive MFA', () => {
    beforeAll(async () => {
      await updateSignInExperience({
        mfa: {
          factors: [MfaFactor.TOTP, MfaFactor.BackupCode],
          policy: MfaPolicy.PromptAtSignInAndSignUp,
        },
        adaptiveMfa: { enabled: true },
      });
    });

    devFeatureTest.it(
      'should throw 403 on backup code bind when adaptive MFA triggers and MFA is not verified',
      async () => {
        const { username, password } = generateNewUserProfile({ username: true, password: true });
        const user = await userApi.create({ username, password });
        await createUserMfaVerification(user.id, MfaFactor.TOTP);

        const client = await initExperienceClient({ extraHeaders: lowBotScoreHeaders });
        await identifyUserWithUsernamePassword(client, username, password);
        const { verificationId } = await client.generateMfaBackupCodes();

        await expectRejects(client.bindMfa(MfaFactor.BackupCode, verificationId), {
          code: 'session.mfa.require_mfa_verification',
          status: 403,
        });
      }
    );
  });

  devFeatureTest.describe('adaptive MFA binding flow', () => {
    beforeAll(async () => {
      await updateSignInExperience({
        mfa: {
          factors: [MfaFactor.TOTP],
          policy: MfaPolicy.PromptAtSignInAndSignUp,
        },
        adaptiveMfa: { enabled: true },
      });
    });

    devFeatureTest.it(
      'should allow submit after binding TOTP when adaptive MFA triggers and user has no MFA factors',
      async () => {
        const { username, password } = generateNewUserProfile({ username: true, password: true });
        await userApi.create({ username, password });

        const client = await initExperienceClient({ extraHeaders: lowBotScoreHeaders });
        await identifyUserWithUsernamePassword(client, username, password);

        await expectRejects(client.submitInteraction(), {
          code: 'user.missing_mfa',
          status: 422,
        });

        const totpVerificationId = await successfullyCreateAndVerifyTotp(client);
        await client.bindMfa(MfaFactor.TOTP, totpVerificationId);

        const { redirectTo } = await client.submitInteraction();
        await processSession(client, redirectTo);
      }
    );
  });
});
