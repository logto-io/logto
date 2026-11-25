import { ConnectorType } from '@logto/connector-kit';
import { InteractionEvent, LogtoActionKey, SignInIdentifier } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { trySafe } from '@silverhand/essentials';

import { mockSocialConnectorTarget } from '#src/__mocks__/connectors-mock.js';
import { deleteUser } from '#src/api/admin-user.js';
import { deleteAction, upsertAction } from '#src/api/logto-config.js';
import { createOneTimeToken, deleteOneTimeTokenById } from '#src/api/one-time-token.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { SsoConnectorApi } from '#src/api/sso-connector.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { clearConnectorsByTypes, setSocialConnector } from '#src/helpers/connector.js';
import {
  successfullyCreateEnterpriseSsoVerification,
  successfullyVerifyEnterpriseSsoAuthorization,
} from '#src/helpers/experience/enterprise-sso-verification.js';
import { registerNewUserUsernamePassword } from '#src/helpers/experience/index.js';
import {
  successfullyCreateSocialVerification,
  successfullyVerifySocialAuthorization,
} from '#src/helpers/experience/social-verification.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import {
  devFeatureDisabledTest,
  devFeatureTest,
  generateEmail,
  generatePassword,
  generateUsername,
} from '#src/utils.js';

const key = LogtoActionKey.PreRegister;

/** A script that denies with a message describing the event, so tests can read what it saw. */
const echoEventScript = (fields: string) => `
  const runAction = ({ event }) => ({
    action: 'deny',
    message: JSON.stringify(${fields}),
  });
`;

const usernameSignUp = {
  identifiers: [SignInIdentifier.Username],
  password: true,
  verify: false,
};

const registerWithUsername = async (username: string) => {
  const client = await initExperienceClient({ interactionEvent: InteractionEvent.Register });
  const { verificationId } = await client.createNewPasswordIdentityVerification({
    identifier: { type: SignInIdentifier.Username, value: username },
    password: generatePassword(),
  });

  return client.identifyUser({ verificationId });
};

const parseMessage = (data: unknown): unknown => {
  const { message } = data as { message: string };
  return JSON.parse(message);
};

devFeatureTest.describe('action: pre-register', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods(usernameSignUp);
  });

  afterEach(async () => {
    await trySafe(deleteAction(key));
  });

  it('should not create the user when the action denies, and pass the message to the client', async () => {
    await upsertAction(key, {
      script: `const runAction = () => ({ action: 'deny', message: 'Use a work email.' });`,
      enabled: true,
    });
    const username = generateUsername();

    await expectRejects(registerWithUsername(username), {
      code: 'action.registration_denied',
      status: 422,
      expectData: (data) => {
        expect(data).toEqual({ message: 'Use a work email.' });
      },
    });

    // The username is still free, so the denied registration did not create a user.
    await deleteAction(key);
    const userId = await registerNewUserUsernamePassword(username, generatePassword());
    await deleteUser(userId);
  });

  it.each([
    ['allow', `const runAction = () => ({ action: 'allow' });`],
    ['no result', `const runAction = () => {};`],
    ['an empty object', `const runAction = () => ({});`],
  ])('should register the user when the action returns %s', async (_, script) => {
    await upsertAction(key, { script, enabled: true });

    const userId = await registerNewUserUsernamePassword(generateUsername(), generatePassword());
    await deleteUser(userId);
  });

  it('should block the registration when the script throws under the default policy', async () => {
    await upsertAction(key, {
      script: `const runAction = () => { throw new Error('ZeroBounce returned 500'); };`,
      enabled: true,
    });

    await expectRejects(registerWithUsername(generateUsername()), {
      code: 'action.general',
      status: 422,
    });
  });

  it('should continue the registration when the script throws under the allow policy', async () => {
    await upsertAction(key, {
      script: `const runAction = () => { throw new Error('ZeroBounce returned 500'); };`,
      enabled: true,
      onExecutionError: 'allow',
    });

    const userId = await registerNewUserUsernamePassword(generateUsername(), generatePassword());
    await deleteUser(userId);
  });

  it('should reject an invalid result regardless of the allow policy', async () => {
    await upsertAction(key, {
      script: `const runAction = () => ({ action: 'updateUser', user: {} });`,
      enabled: true,
      onExecutionError: 'allow',
    });

    await expectRejects(registerWithUsername(generateUsername()), {
      code: 'action.general',
      status: 422,
    });
  });

  it('should pass the profile and verification types of a username registration', async () => {
    await upsertAction(key, {
      script: echoEventScript(
        '{ key: event.key, types: event.verificationTypes, username: event.user.username, hasPassword: Object.keys(event.user).some((field) => field.startsWith("password")) }'
      ),
      enabled: true,
    });
    const username = generateUsername();

    const data = await expectRejects(registerWithUsername(username), {
      code: 'action.registration_denied',
      status: 422,
    });

    expect(parseMessage(data)).toEqual({
      key,
      types: ['NewPasswordIdentity'],
      username,
      hasPassword: false,
    });
  });

  describe('without mandatory sign-up identifiers', () => {
    beforeAll(async () => {
      await enableAllPasswordSignInMethods({ identifiers: [], password: false, verify: false });
    });

    afterAll(async () => {
      await enableAllPasswordSignInMethods(usernameSignUp);
      await clearConnectorsByTypes([ConnectorType.Social]);
    });

    it('should pass the social identity without raw data', async () => {
      await clearConnectorsByTypes([ConnectorType.Social]);
      const { id: connectorId } = await setSocialConnector();
      await upsertAction(key, {
        script: echoEventScript(
          '{ types: event.verificationTypes, target: event.user.socialIdentity.target, id: event.user.socialIdentity.userInfo.id, hasRawData: "rawData" in event.user.socialIdentity.userInfo }'
        ),
        enabled: true,
      });

      const socialUserId = generateStandardId();
      const state = 'state';
      const redirectUri = 'http://localhost:3000';
      const client = await initExperienceClient();
      const { verificationId } = await successfullyCreateSocialVerification(client, connectorId, {
        redirectUri,
        state,
      });
      await successfullyVerifySocialAuthorization(client, connectorId, {
        verificationId,
        connectorData: { state, redirectUri, code: 'fake_code', userId: socialUserId },
      });
      await client.updateInteractionEvent({ interactionEvent: InteractionEvent.Register });

      const data = await expectRejects(client.identifyUser({ verificationId }), {
        code: 'action.registration_denied',
        status: 422,
      });

      expect(parseMessage(data)).toEqual({
        types: ['Social'],
        target: mockSocialConnectorTarget,
        id: socialUserId,
        hasRawData: false,
      });
    });

    it('should pass the enterprise SSO identity without detail', async () => {
      const ssoConnectorApi = new SsoConnectorApi();
      const domain = 'pre-register-sso.example.com';
      const identityId = generateStandardId();
      const email = generateEmail(domain);

      try {
        const connector = await ssoConnectorApi.createMockOidcConnector([domain]);
        await updateSignInExperience({ singleSignOnEnabled: true });
        await upsertAction(key, {
          script: echoEventScript(
            '{ types: event.verificationTypes, connectorId: event.user.enterpriseSsoIdentity.ssoConnectorId, identityId: event.user.enterpriseSsoIdentity.identityId, hasDetail: "detail" in event.user.enterpriseSsoIdentity }'
          ),
          enabled: true,
        });

        const state = 'state';
        const redirectUri = 'http://localhost:3000';
        const client = await initExperienceClient();
        const { verificationId } = await successfullyCreateEnterpriseSsoVerification(
          client,
          connector.id,
          { redirectUri, state }
        );
        await successfullyVerifyEnterpriseSsoAuthorization(client, connector.id, {
          verificationId,
          connectorData: { sub: identityId, email, email_verified: true },
        });
        await client.updateInteractionEvent({ interactionEvent: InteractionEvent.Register });

        const data = await expectRejects(client.identifyUser({ verificationId }), {
          code: 'action.registration_denied',
          status: 422,
        });

        expect(parseMessage(data)).toEqual({
          types: ['EnterpriseSso'],
          connectorId: connector.id,
          identityId,
          hasDetail: false,
        });
      } finally {
        await trySafe(updateSignInExperience({ singleSignOnEnabled: false }));
        await ssoConnectorApi.cleanUp();
      }
    });

    it('should report a one-time token registration in the verification types', async () => {
      await upsertAction(key, {
        script: echoEventScript(
          '{ types: event.verificationTypes, email: event.user.primaryEmail }'
        ),
        enabled: true,
      });
      const email = generateEmail();
      const oneTimeToken = await createOneTimeToken({ email });

      const client = await initExperienceClient({ interactionEvent: InteractionEvent.Register });
      const { verificationId } = await client.verifyOneTimeToken({
        token: oneTimeToken.token,
        identifier: { type: SignInIdentifier.Email, value: email },
      });

      const data = await expectRejects(client.identifyUser({ verificationId }), {
        code: 'action.registration_denied',
        status: 422,
      });

      expect(parseMessage(data)).toEqual({ types: ['OneTimeToken'], email });

      await deleteOneTimeTokenById(oneTimeToken.id);
    });
  });
});

devFeatureDisabledTest.describe('action: pre-register while dev features are disabled', () => {
  it('should not accept a pre-register action configuration', async () => {
    await expectRejects(
      upsertAction(key, { script: `const runAction = () => ({ action: 'deny' });`, enabled: true }),
      { code: 'guard.invalid_input', status: 400 }
    );
  });
});
