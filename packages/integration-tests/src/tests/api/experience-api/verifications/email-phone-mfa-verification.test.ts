import { ConnectorType } from '@logto/connector-kit';
import {
  InteractionEvent,
  SignInIdentifier,
  type VerificationCodeSignInIdentifier,
} from '@logto/schemas';

import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import {
  successfullySendMfaVerificationCode,
  successfullySendVerificationCode,
  successfullyVerifyMfaVerificationCode,
  successfullyVerifyVerificationCode,
} from '#src/helpers/experience/verification-code.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  enableAllVerificationCodeSignInMethods,
  enableMandatoryMfaWithEmail,
  enableMandatoryMfaWithPhone,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';

const mfaTestCases = [
  {
    type: 'Email',
    identifierType: SignInIdentifier.Email as VerificationCodeSignInIdentifier,
    setConnector: setEmailConnector,
    enableMfa: enableMandatoryMfaWithEmail,
    userProfileKey: 'primaryEmail' as const,
  },
  {
    type: 'Phone',
    identifierType: SignInIdentifier.Phone as VerificationCodeSignInIdentifier,
    setConnector: setSmsConnector,
    enableMfa: enableMandatoryMfaWithPhone,
    userProfileKey: 'primaryPhone' as const,
  },
];

describe.each(mfaTestCases)(
  '$type MFA verification APIs',
  ({ type, identifierType, setConnector, enableMfa, userProfileKey }) => {
    const userApi = new UserApiTest();

    beforeAll(async () => {
      await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
      await setConnector();
      await enableAllPasswordSignInMethods();
      await enableMfa();
    });

    afterAll(async () => {
      await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
      await resetMfaSettings();
    });

    afterEach(async () => {
      await userApi.cleanUp();
    });

    it(`should verify ${type} MFA during sign-in when user already has ${type.toLowerCase()} set`, async () => {
      await enableMfa();

      const userProfile = generateNewUserProfile({
        username: true,
        password: true,
        [userProfileKey]: true,
      });
      await userApi.create(userProfile);

      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.SignIn,
      });
      await identifyUserWithUsernamePassword(client, userProfile.username, userProfile.password);

      const identifierValue = userProfile[userProfileKey]!;
      // Use the new consolidated MFA verification endpoint
      const { verificationId, code } = await successfullySendMfaVerificationCode(client, {
        identifierType,
        expectedIdentifierValue: identifierValue,
      });
      await successfullyVerifyMfaVerificationCode(client, {
        identifierType,
        verificationId,
        code,
      });

      const { redirectTo } = await client.submitInteraction();
      await processSession(client, redirectTo);
      await logoutClient(client);
    });
  }
);

describe('MFA verification code factor guard', () => {
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await Promise.all([setEmailConnector(), setSmsConnector()]);
    await enableAllVerificationCodeSignInMethods();
    await resetMfaSettings();
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await enableAllPasswordSignInMethods();
    await userApi.cleanUp();
  });

  it.each([
    { identifierType: SignInIdentifier.Email, profileKey: 'primaryEmail' },
    { identifierType: SignInIdentifier.Phone, profileKey: 'primaryPhone' },
  ] as const)(
    'refuses an MFA code for the $identifierType that identified the user when the factor is not enabled',
    async ({ identifierType, profileKey }) => {
      const profile = generateNewUserProfile({ primaryEmail: true, primaryPhone: true });
      await userApi.create(profile);
      const identifier = { type: identifierType, value: profile[profileKey] };

      const client = await initExperienceClient();
      const { verificationId, code } = await successfullySendVerificationCode(client, {
        identifier,
        interactionEvent: InteractionEvent.SignIn,
      });
      await successfullyVerifyVerificationCode(client, { identifier, verificationId, code });
      await client.identifyUser({ verificationId });

      // A second code to the same contact would only re-prove the contact that already identified
      // the user. The route refuses it because the sign-in experience does not enable that MFA
      // factor; sign-in with a contact and MFA through the same contact cannot both be enabled.
      await expectRejects(client.sendMfaVerificationCode({ identifierType }), {
        code: 'session.mfa.mfa_factor_not_enabled',
        status: 400,
      });
    }
  );
});
