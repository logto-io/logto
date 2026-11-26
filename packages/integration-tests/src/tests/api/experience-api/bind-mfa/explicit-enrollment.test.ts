import { ConnectorType } from '@logto/connector-kit';
import { UserScope } from '@logto/core-kit';
import {
  InteractionEvent,
  MfaFactor,
  MfaPolicy,
  MfaVerificationCodeEnrollment,
  SignInIdentifier,
  type SignInExperience,
} from '@logto/schemas';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import {
  createUserMfaVerification,
  deleteUser,
  deleteUserMfaVerification,
  getUserMfaVerifications,
} from '#src/api/admin-user.js';
import { addMfaVerification } from '#src/api/my-account.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { createVerificationRecordByPassword } from '#src/api/verification-record.js';
import { type ExperienceClient } from '#src/client/experience/index.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import {
  identifyUserWithUsernamePassword,
  signInWithPassword,
} from '#src/helpers/experience/index.js';
import {
  successfullySendVerificationCode,
  successfullyVerifyVerificationCode,
} from '#src/helpers/experience/verification-code.js';
import { expectRejects } from '#src/helpers/index.js';
import { signInAndGetUserApi } from '#src/helpers/profile.js';
import { resetMfaSettings } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';

const signUpWith = (
  secondaryIdentifiers: Array<SignInIdentifier.Email | SignInIdentifier.Phone>
): Pick<SignInExperience, 'signUp' | 'signIn'> => ({
  signUp: {
    identifiers: [SignInIdentifier.Username],
    password: true,
    verify: true,
    secondaryIdentifiers: secondaryIdentifiers.map((identifier) => ({ identifier, verify: true })),
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

const explicitMfa = (factors: MfaFactor[], policy: MfaPolicy) => ({
  factors,
  policy,
  verificationCodeEnrollment: MfaVerificationCodeEnrollment.Explicit,
});

/** Verify a sign-up code for the identifier and add it to the profile. */
const fulfillVerifiedIdentifier = async (
  client: ExperienceClient,
  type: SignInIdentifier.Email | SignInIdentifier.Phone,
  value: string
) => {
  const { verificationId, code } = await successfullySendVerificationCode(client, {
    identifier: { type, value },
    interactionEvent: InteractionEvent.Register,
  });
  await successfullyVerifyVerificationCode(client, {
    identifier: { type, value },
    verificationId,
    code,
  });
  await client.updateProfile({ type, verificationId });

  return verificationId;
};

/** Start a registration with a username, a password, and the given verified identifiers. */
const startRegistration = async (identifiers: { primaryEmail?: string; primaryPhone?: string }) => {
  const { username, password } = generateNewUserProfile({ username: true, password: true });
  const client = await initExperienceClient({ interactionEvent: InteractionEvent.Register });

  await client.updateProfile({ type: SignInIdentifier.Username, value: username });
  await client.updateProfile({ type: 'password', value: password });

  const emailVerificationId =
    identifiers.primaryEmail &&
    (await fulfillVerifiedIdentifier(client, SignInIdentifier.Email, identifiers.primaryEmail));
  const phoneVerificationId =
    identifiers.primaryPhone &&
    (await fulfillVerifiedIdentifier(client, SignInIdentifier.Phone, identifiers.primaryPhone));

  await client.identifyUser();

  return { client, username, password, emailVerificationId, phoneVerificationId };
};

const finishInteraction = async (client: ExperienceClient) => {
  const { redirectTo } = await client.submitInteraction();
  const userId = await processSession(client, redirectTo);
  await logoutClient(client);

  return userId;
};

const signInWithUsername = async (username: string, password: string) =>
  signInWithPassword({
    identifier: { type: SignInIdentifier.Username, value: username },
    password,
  });

const expectMfaChallenge = async (
  username: string,
  password: string,
  availableFactors: MfaFactor[]
) => {
  const client = await initExperienceClient();
  await identifyUserWithUsernamePassword(client, username, password);

  await expectRejects<{ availableFactors: MfaFactor[] }>(client.submitInteraction(), {
    code: 'session.mfa.require_mfa_verification',
    status: 403,
    expectData: (data) => {
      expect(data.availableFactors).toEqual(availableFactors);
    },
  });
};

describe('explicit email and phone MFA enrollment', () => {
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await Promise.all([setEmailConnector(), setSmsConnector()]);
    await updateSignInExperience({ adaptiveMfa: { enabled: false } });
  });

  afterEach(async () => {
    await userApi.cleanUp();
  });

  const createUserWithEmail = async () => {
    const profile = generateNewUserProfile({
      username: true,
      password: true,
      primaryEmail: true,
    });
    const user = await userApi.create(profile);
    return { ...profile, user };
  };

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await resetMfaSettings();
  });

  it('does not challenge a new user for the verified sign-up email until they enroll it', async () => {
    await enableAllAccountCenterFields();
    await updateSignInExperience({
      ...signUpWith([SignInIdentifier.Email]),
      mfa: explicitMfa([MfaFactor.EmailVerificationCode], MfaPolicy.NoPrompt),
    });

    const { primaryEmail } = generateNewUserProfile({ primaryEmail: true });
    const { client, username, password } = await startRegistration({ primaryEmail });
    const userId = await finishInteraction(client);

    const api = await signInAndGetUserApi(username, password, {
      scopes: [UserScope.Profile, UserScope.Identities],
    });
    await addMfaVerification(api, await createVerificationRecordByPassword(api, password), {
      type: MfaFactor.EmailVerificationCode,
    });

    await expectMfaChallenge(username, password, [MfaFactor.EmailVerificationCode]);

    await deleteUser(userId);
  });

  describe('optional MFA', () => {
    beforeAll(async () => {
      await updateSignInExperience({
        ...signUpWith([SignInIdentifier.Email]),
        mfa: explicitMfa(
          [MfaFactor.TOTP, MfaFactor.EmailVerificationCode],
          MfaPolicy.PromptAtSignInAndSignUp
        ),
      });
    });

    it('offers every enabled factor, including the verified sign-up email', async () => {
      const { primaryEmail } = generateNewUserProfile({ primaryEmail: true });
      const { client } = await startRegistration({ primaryEmail });

      await expectRejects(client.submitInteraction(), { code: 'user.suggest_mfa', status: 422 });
      await client.enableMfa();

      await expectRejects<{
        availableFactors: MfaFactor[];
        maskedIdentifiers?: Record<string, string>;
      }>(client.submitInteraction(), {
        code: 'user.missing_mfa',
        status: 422,
        expectData: (data) => {
          expect(data.availableFactors).toHaveLength(2);
          expect(data.availableFactors).toEqual(
            expect.arrayContaining([MfaFactor.TOTP, MfaFactor.EmailVerificationCode])
          );
          expect(data.maskedIdentifiers?.[MfaFactor.EmailVerificationCode]).toMatch(/\*{4}/);
        },
      });

      const { userId } = await client.getInteractionData();
      await deleteUser(userId!);
    });

    it('does not challenge a user who skipped', async () => {
      const { primaryEmail } = generateNewUserProfile({ primaryEmail: true });
      const { client, username, password } = await startRegistration({ primaryEmail });

      await expectRejects(client.submitInteraction(), { code: 'user.suggest_mfa', status: 422 });
      await client.skipMfaBinding();
      const userId = await finishInteraction(client);

      await signInWithUsername(username, password);

      await deleteUser(userId);
    });
  });

  it('enrolls the verified sign-up phone under mandatory MFA without a second prompt', async () => {
    await updateSignInExperience({
      ...signUpWith([SignInIdentifier.Email, SignInIdentifier.Phone]),
      mfa: explicitMfa([MfaFactor.PhoneVerificationCode], MfaPolicy.Mandatory),
    });

    const { primaryEmail, primaryPhone } = generateNewUserProfile({
      primaryEmail: true,
      primaryPhone: true,
    });
    const { client, username, password, phoneVerificationId } = await startRegistration({
      primaryEmail,
      primaryPhone,
    });

    await expectRejects<{
      availableFactors: MfaFactor[];
      maskedIdentifiers?: Record<string, string>;
    }>(client.submitInteraction(), {
      code: 'user.missing_mfa',
      status: 422,
      expectData: (data) => {
        expect(data.availableFactors).toEqual([MfaFactor.PhoneVerificationCode]);
        expect(data.maskedIdentifiers?.[MfaFactor.PhoneVerificationCode]).toMatch(/\*{4}/);
      },
    });

    await client.bindMfa(MfaFactor.PhoneVerificationCode, phoneVerificationId!);
    const userId = await finishInteraction(client);

    expect(await getUserMfaVerifications(userId)).toEqual([
      expect.objectContaining({ type: MfaFactor.PhoneVerificationCode }),
    ]);
    await expectMfaChallenge(username, password, [MfaFactor.PhoneVerificationCode]);

    await deleteUser(userId);
  });

  it('lets an admin add and remove email MFA for a user who has TOTP', async () => {
    await updateSignInExperience({
      ...signUpWith([]),
      mfa: explicitMfa(
        [MfaFactor.TOTP, MfaFactor.EmailVerificationCode],
        MfaPolicy.PromptAtSignInAndSignUp
      ),
    });

    const { username, password, primaryEmail } = generateNewUserProfile({
      username: true,
      password: true,
      primaryEmail: true,
    });
    const user = await userApi.create({ username, password, primaryEmail });
    await createUserMfaVerification(user.id, MfaFactor.TOTP);

    await expectMfaChallenge(username, password, [MfaFactor.TOTP]);

    const emailMfa = await createUserMfaVerification(user.id, MfaFactor.EmailVerificationCode);
    expect(emailMfa).toMatchObject({ type: MfaFactor.EmailVerificationCode });
    await expectMfaChallenge(username, password, [MfaFactor.TOTP, MfaFactor.EmailVerificationCode]);

    if (!('id' in emailMfa)) {
      throw new Error('Expected the created email MFA record to have an ID');
    }
    await deleteUserMfaVerification(user.id, emailMfa.id);
    await expectMfaChallenge(username, password, [MfaFactor.TOTP]);
  });

  it('applies a mode switch to users with and without a record', async () => {
    const mfa = { factors: [MfaFactor.EmailVerificationCode], policy: MfaPolicy.NoPrompt };
    await updateSignInExperience({ ...signUpWith([]), mfa });

    const unenrolled = await createUserWithEmail();
    const enrolled = await createUserWithEmail();
    await createUserMfaVerification(enrolled.user.id, MfaFactor.EmailVerificationCode);

    await updateSignInExperience({
      mfa: { ...mfa, verificationCodeEnrollment: MfaVerificationCodeEnrollment.Explicit },
    });
    await signInWithUsername(unenrolled.username, unenrolled.password);
    await expectMfaChallenge(enrolled.username, enrolled.password, [
      MfaFactor.EmailVerificationCode,
    ]);

    await updateSignInExperience({
      mfa: { ...mfa, verificationCodeEnrollment: MfaVerificationCodeEnrollment.Implicit },
    });
    await expectMfaChallenge(unenrolled.username, unenrolled.password, [
      MfaFactor.EmailVerificationCode,
    ]);
    await expectMfaChallenge(enrolled.username, enrolled.password, [
      MfaFactor.EmailVerificationCode,
    ]);
  });
});
