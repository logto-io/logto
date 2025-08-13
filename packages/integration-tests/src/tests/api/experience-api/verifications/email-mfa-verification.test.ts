import { ConnectorType } from '@logto/connector-kit';
import { InteractionEvent, SignInIdentifier } from '@logto/schemas';

import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import {
  successfullySendVerificationCode,
  successfullyVerifyVerificationCode,
} from '#src/helpers/experience/verification-code.js';
import {
  enableAllPasswordSignInMethods,
  enableMandatoryMfaWithEmail,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

const { describe, it } = devFeatureTest;

describe('Email MFA verification APIs', () => {
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email]);
    await setEmailConnector();
    await enableAllPasswordSignInMethods();
    await enableMandatoryMfaWithEmail();
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email]);
    await resetMfaSettings();
  });

  afterEach(async () => {
    await userApi.cleanUp();
  });

  it('should verify Email MFA during sign-in when user already has email set', async () => {
    await enableMandatoryMfaWithEmail();

    const { username, password, primaryEmail } = generateNewUserProfile({
      username: true,
      password: true,
      primaryEmail: true,
    });
    await userApi.create({ username, password, primaryEmail });

    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.SignIn,
    });
    await identifyUserWithUsernamePassword(client, username, password);

    const { verificationId, code } = await successfullySendVerificationCode(client, {
      identifier: { type: SignInIdentifier.Email, value: primaryEmail },
      interactionEvent: InteractionEvent.SignIn,
    });
    await successfullyVerifyVerificationCode(client, {
      identifier: { type: SignInIdentifier.Email, value: primaryEmail },
      verificationId,
      code,
    });

    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    await logoutClient(client);
  });
});
