import { InteractionEvent, InteractionIdentifierType, MfaFactor } from '@logto/schemas';
import { authenticator } from 'otplib';

import { createUserMfaVerification } from '#src/api/admin-user.js';
import { type ExperienceClient } from '#src/client/experience/index.js';
import { initExperienceClient } from '#src/helpers/client.js';
import {
  successFullyCreateNewTotpSecret,
  successFullyVerifyTotp,
} from '#src/helpers/experience/totp-verification.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { UserApiTest, generateNewUserProfile } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

const identifyUserWithPassword = async (
  client: ExperienceClient,
  username: string,
  password: string
) => {
  const { verificationId } = await client.verifyPassword({
    identifier: {
      type: InteractionIdentifierType.Username,
      value: username,
    },
    password,
  });

  await client.identifyUser({ interactionEvent: InteractionEvent.SignIn, verificationId });

  return { verificationId };
};

devFeatureTest.describe('TOTP verification APIs', () => {
  const { username, password } = generateNewUserProfile({ username: true, password: true });
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await userApi.create({ username, password });
  });

  afterAll(async () => {
    await userApi.cleanUp();
  });

  describe('Create new TOTP secret', () => {
    it('should throw 400 if the user is not identified', async () => {
      const client = await initExperienceClient();

      await expectRejects(client.createTotpSecret(), {
        code: 'session.not_identified',
        status: 400,
      });
    });

    it('should create a new TOTP secret successfully', async () => {
      const client = await initExperienceClient();

      await identifyUserWithPassword(client, username, password);

      await successFullyCreateNewTotpSecret(client);
    });
  });

  describe('Verify new TOTP secret', () => {
    it('should throw 400 if the user is not identified', async () => {
      const client = await initExperienceClient();

      await expectRejects(client.verifyTotp({ code: '1234' }), {
        code: 'session.not_identified',
        status: 400,
      });
    });

    it('should throw 400 if the verification record is not found', async () => {
      const client = await initExperienceClient();

      await identifyUserWithPassword(client, username, password);

      await expectRejects(client.verifyTotp({ code: '1234', verificationId: 'invalid_id' }), {
        code: 'session.verification_session_not_found',
        status: 404,
      });
    });

    it('should throw 400 if the verification record is not a TOTP verification', async () => {
      const client = await initExperienceClient();

      const { verificationId } = await identifyUserWithPassword(client, username, password);

      await expectRejects(client.verifyTotp({ code: '1234', verificationId }), {
        code: 'session.verification_session_not_found',
        status: 404,
      });
    });

    it('should throw 400 if the code is invalid', async () => {
      const client = await initExperienceClient();

      await identifyUserWithPassword(client, username, password);

      const { verificationId } = await successFullyCreateNewTotpSecret(client);

      await expectRejects(client.verifyTotp({ code: '1234', verificationId }), {
        code: 'session.mfa.invalid_totp_code',
        status: 400,
      });
    });

    it('should verify the new TOTP secret successfully', async () => {
      const client = await initExperienceClient();

      await identifyUserWithPassword(client, username, password);

      const { verificationId, secret } = await successFullyCreateNewTotpSecret(client);
      const code = authenticator.generate(secret);

      await successFullyVerifyTotp(client, { code, verificationId });
    });
  });

  describe('Verify existing TOTP secret', () => {
    it('should throw 400 if the user is not identified', async () => {
      const client = await initExperienceClient();

      await expectRejects(client.verifyTotp({ code: '1234' }), {
        code: 'session.not_identified',
        status: 400,
      });
    });

    it('should throw 400 if the user does not have TOTP verification', async () => {
      const client = await initExperienceClient();

      await identifyUserWithPassword(client, username, password);

      await expectRejects(client.verifyTotp({ code: '1234' }), {
        code: 'session.mfa.invalid_totp_code',
        status: 400,
      });
    });

    it('should throw 400 if the code is invalid', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const user = await userApi.create({ username, password });

      await createUserMfaVerification(user.id, MfaFactor.TOTP);

      const client = await initExperienceClient();

      await identifyUserWithPassword(client, username, password);

      await expectRejects(client.verifyTotp({ code: '1234' }), {
        code: 'session.mfa.invalid_totp_code',
        status: 400,
      });
    });

    it('should verify the existing TOTP secret successfully', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      const user = await userApi.create({ username, password });

      const response = await createUserMfaVerification(user.id, MfaFactor.TOTP);

      if (response.type !== MfaFactor.TOTP) {
        throw new Error('Invalid response');
      }

      const { secret } = response;

      const client = await initExperienceClient();

      await identifyUserWithPassword(client, username, password);

      const code = authenticator.generate(secret);

      await successFullyVerifyTotp(client, { code });
    });
  });
});
