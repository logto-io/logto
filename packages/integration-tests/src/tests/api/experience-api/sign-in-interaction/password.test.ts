import { InteractionEvent, SignInIdentifier } from '@logto/schemas';

import { deleteUser, getUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { setEmailConnector, setSmsConnector } from '#src/helpers/connector.js';
import {
  identifyUserWithUsernamePassword,
  signInWithPassword,
} from '#src/helpers/experience/index.js';
import {
  successfullySendVerificationCode,
  successfullyVerifyVerificationCode,
} from '#src/helpers/experience/verification-code.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  enableAllVerificationCodeSignInMethods,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUser, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest, generateEmail, generatePassword } from '#src/utils.js';

const identifiersTypeToUserProfile = Object.freeze({
  username: 'username',
  email: 'primaryEmail',
  phone: 'primaryPhone',
  userId: '',
});

describe.skip('sign-in with password verification happy path', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await Promise.all([setEmailConnector(), setSmsConnector()]);
  });

  it.each([SignInIdentifier.Username, SignInIdentifier.Email, SignInIdentifier.Phone])(
    'should sign-in with password using %p',
    async (identifier) => {
      const { userProfile, user } = await generateNewUser({
        [identifiersTypeToUserProfile[identifier]]: true,
        password: true,
      });

      await signInWithPassword({
        identifier: {
          type: identifier,
          value: userProfile[identifiersTypeToUserProfile[identifier]]!,
        },
        password: userProfile.password,
      });

      await deleteUser(user.id);
    }
  );

  it('sign-in with username and password and fulfill the email', async () => {
    await enableAllVerificationCodeSignInMethods({
      identifiers: [SignInIdentifier.Email],
      password: true,
      verify: true,
    });

    const { userProfile, user } = await generateNewUser({
      username: true,
      password: true,
    });
    const { username, password } = userProfile;

    const primaryEmail = generateEmail();

    const client = await initExperienceClient();

    await identifyUserWithUsernamePassword(client, username, password);

    await expectRejects(client.submitInteraction(), {
      code: 'user.missing_profile',
      status: 422,
    });

    const { verificationId, code: verificationCode } = await successfullySendVerificationCode(
      client,
      {
        identifier: { type: SignInIdentifier.Email, value: primaryEmail },
        interactionEvent: InteractionEvent.SignIn,
      }
    );

    await successfullyVerifyVerificationCode(client, {
      identifier: { type: SignInIdentifier.Email, value: primaryEmail },
      verificationId,
      code: verificationCode,
    });

    await client.updateProfile({ type: SignInIdentifier.Email, verificationId });

    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    await logoutClient(client);

    const { primaryEmail: syncedEmail } = await getUser(user.id);

    expect(syncedEmail).toBe(primaryEmail);

    await deleteUser(user.id);
  });

  devFeatureTest.it('should throw 422 if the fulfilled email is in the blocklist', async () => {
    const blockEmail = generateEmail();
    await updateSignInExperience({
      emailBlocklistPolicy: {
        customBlocklist: [blockEmail],
      },
    });

    const { userProfile, user } = await generateNewUser({
      username: true,
      password: true,
    });

    const { username, password } = userProfile;
    const client = await initExperienceClient();

    await identifyUserWithUsernamePassword(client, username, password);
    await expectRejects(client.submitInteraction(), {
      code: 'user.missing_profile',
      status: 422,
    });

    const { verificationId, code: verificationCode } = await successfullySendVerificationCode(
      client,
      {
        identifier: { type: SignInIdentifier.Email, value: blockEmail },
        interactionEvent: InteractionEvent.SignIn,
      }
    );

    await successfullyVerifyVerificationCode(client, {
      identifier: { type: SignInIdentifier.Email, value: blockEmail },
      verificationId,
      code: verificationCode,
    });

    await expectRejects(client.updateProfile({ type: SignInIdentifier.Email, verificationId }), {
      code: 'session.email_blocklist.email_not_allowed',
      status: 422,
    });

    await deleteUser(user.id);
  });
});

describe('phone number sanitisation sign-in test +61 412 345 678', () => {
  const testPhoneNumber = '61412345678';
  const testPhoneNumberWithLeadingZero = '610412345678';
  const password = generatePassword();
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await updateSignInExperience({
      sentinelPolicy: {
        maxAttempts: 100,
      },
    });
  });

  afterEach(async () => {
    await userApi.cleanUp();
  });

  type TestCase = {
    registerPhone: string;
    signInPhone: string;
  };
  const testCases: TestCase[] = [
    {
      registerPhone: testPhoneNumber,
      signInPhone: testPhoneNumber,
    },
    {
      registerPhone: testPhoneNumberWithLeadingZero,
      signInPhone: testPhoneNumberWithLeadingZero,
    },
    {
      registerPhone: testPhoneNumber,
      signInPhone: testPhoneNumberWithLeadingZero,
    },
    {
      registerPhone: testPhoneNumberWithLeadingZero,
      signInPhone: testPhoneNumber,
    },
  ];

  it.each(testCases)(
    'should register with $registerPhone and sign-in with $signInPhone successfully',
    async ({ registerPhone, signInPhone }) => {
      const user = await userApi.create({
        primaryPhone: registerPhone,
        password,
      });

      await signInWithPassword({
        identifier: {
          type: SignInIdentifier.Phone,
          value: signInPhone,
        },
        password,
      });
    }
  );

  it('should sign-in with extact phone number if multiple account is found', async () => {
    const passwordA = generatePassword();
    const passwordB = generatePassword();

    await userApi.create({
      primaryPhone: testPhoneNumber,
      password: passwordA,
    });

    await userApi.create({
      primaryPhone: testPhoneNumberWithLeadingZero,
      password: passwordB,
    });

    await signInWithPassword({
      identifier: {
        type: SignInIdentifier.Phone,
        value: testPhoneNumber,
      },
      password: passwordA,
    });

    await signInWithPassword({
      identifier: {
        type: SignInIdentifier.Phone,
        value: testPhoneNumberWithLeadingZero,
      },
      password: passwordB,
    });
  });
});
