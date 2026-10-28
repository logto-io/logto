import { ConnectorType } from '@logto/connector-kit';
import { InteractionEvent, MfaFactor, MfaPolicy, SignInIdentifier } from '@logto/schemas';

import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { successfullyCreateAndVerifyTotp } from '#src/helpers/experience/totp-verification.js';
import { successfullySendMfaVerificationCode } from '#src/helpers/experience/verification-code.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  enableMandatoryMfaWithTotp,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { generateEmail } from '#src/utils.js';

describe('PUT /experience/interaction-event', () => {
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    });
  });

  afterAll(async () => {
    await userApi.cleanUp();
  });

  it('should discard the identified user and keep the verification records', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const { id: userId } = await userApi.create({ username, password });

    const client = await initExperienceClient();
    const { verificationId } = await identifyUserWithUsernamePassword(client, username, password);

    await expect(client.getInteractionData()).resolves.toMatchObject({ userId });

    await client.updateInteractionEvent({ interactionEvent: InteractionEvent.Register });

    const data = await client.getInteractionData();

    expect(data.userId).toBeUndefined();
    // The verification records outlive the switch on purpose: a registration that follows a
    // sign-in attempt creates the account from the record the sign-in already verified.
    expect(data.verificationRecords).toMatchObject([{ id: verificationId, verified: true }]);
  });

  it('should discard the profile staged before the event changed', async () => {
    const { username } = generateNewUserProfile({ username: true });

    const client = await initExperienceClient({ interactionEvent: InteractionEvent.Register });
    await client.updateProfile({ type: SignInIdentifier.Username, value: username });

    await expect(client.getInteractionData()).resolves.toMatchObject({ profile: { username } });

    await client.updateInteractionEvent({ interactionEvent: InteractionEvent.SignIn });

    const { profile } = await client.getInteractionData();

    expect(profile).toEqual({});
  });

  describe('mandatory TOTP', () => {
    beforeAll(async () => {
      await enableMandatoryMfaWithTotp();
    });

    afterAll(async () => {
      await resetMfaSettings();
    });

    it('should discard an MFA factor bound before the event changed', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      await userApi.create({ username, password });

      const client = await initExperienceClient();
      await identifyUserWithUsernamePassword(client, username, password);

      const totpVerificationId = await successfullyCreateAndVerifyTotp(client);
      await client.bindMfa(MfaFactor.TOTP, totpVerificationId);

      await expect(client.getInteractionData()).resolves.toMatchObject({
        mfa: { totp: { type: MfaFactor.TOTP } },
      });

      await client.updateInteractionEvent({ interactionEvent: InteractionEvent.Register });

      const { mfa } = await client.getInteractionData();

      expect(mfa).toEqual({});
    });
  });

  describe('email MFA factor', () => {
    beforeAll(async () => {
      await clearConnectorsByTypes([ConnectorType.Email]);
      await setEmailConnector();
      await updateSignInExperience({
        mfa: { factors: [MfaFactor.EmailVerificationCode], policy: MfaPolicy.NoPrompt },
      });
    });

    afterAll(async () => {
      await clearConnectorsByTypes([ConnectorType.Email]);
      await resetMfaSettings();
    });

    it('should refuse an MFA challenge issued before the event changed', async () => {
      const identified = generateNewUserProfile({ username: true, password: true });
      const primaryEmail = generateEmail();
      await userApi.create({ ...identified, primaryEmail });

      const registered = generateNewUserProfile({ username: true, password: true });

      const client = await initExperienceClient();
      await identifyUserWithUsernamePassword(client, identified.username, identified.password);

      const { verificationId, code } = await successfullySendMfaVerificationCode(client, {
        identifierType: SignInIdentifier.Email,
        expectedIdentifierValue: primaryEmail,
      });

      await client.updateInteractionEvent({ interactionEvent: InteractionEvent.Register });

      const { verificationId: passwordVerificationId } =
        await client.createNewPasswordIdentityVerification({
          identifier: { type: SignInIdentifier.Username, value: registered.username },
          password: registered.password,
        });
      await client.identifyUser({ verificationId: passwordVerificationId });

      // The challenge was issued for the user identified at the time, so it cannot answer for the
      // one this interaction now carries.
      await expectRejects(
        client.verifyMfaVerificationCode({
          identifierType: SignInIdentifier.Email,
          verificationId,
          code,
        }),
        { code: 'session.verification_failed', status: 400 }
      );
    });
  });
});
