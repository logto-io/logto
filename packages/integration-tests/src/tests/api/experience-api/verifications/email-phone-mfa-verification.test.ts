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
  successfullyVerifyMfaVerificationCode,
} from '#src/helpers/experience/verification-code.js';
import {
  enableAllPasswordSignInMethods,
  enableMandatoryMfaWithEmail,
  enableMandatoryMfaWithPhone,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

const { describe, it } = devFeatureTest;

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
