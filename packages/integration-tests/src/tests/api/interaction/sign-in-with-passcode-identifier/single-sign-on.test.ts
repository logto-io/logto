import { ConnectorType, InteractionEvent, SignInIdentifier } from '@logto/schemas';

import { createUser, deleteUser } from '#src/api/admin-user.js';
import {
  putInteraction,
  sendVerificationCode,
  patchInteractionIdentifiers,
} from '#src/api/interaction.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { createSsoConnector, deleteSsoConnectorById } from '#src/api/sso-connector.js';
import { newOidcSsoConnectorPayload } from '#src/constants.js';
import { initClient, processSession, logoutClient } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  clearSsoConnectors,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import { expectRejects, readConnectorMessage } from '#src/helpers/index.js';
import { enableAllVerificationCodeSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateEmail, generateSsoConnectorName } from '#src/utils.js';

const happyPath = async (email: string) => {
  const user = await createUser({ primaryEmail: email });
  const client = await initClient();

  await client.successSend(putInteraction, {
    event: InteractionEvent.SignIn,
  });

  await client.successSend(sendVerificationCode, {
    email,
  });

  const verificationCodeRecord = await readConnectorMessage('Email');

  expect(verificationCodeRecord).toMatchObject({
    address: email,
    type: InteractionEvent.SignIn,
  });

  const { code } = verificationCodeRecord;

  await client.successSend(patchInteractionIdentifiers, {
    email,
    verificationCode: code,
  });

  const { redirectTo } = await client.submitInteraction();

  await processSession(client, redirectTo);
  await logoutClient(client);
  await deleteUser(user.id);
};

describe('test sign-in with email passcode identifier with SSO feature', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();
    await setSmsConnector();
    await enableAllVerificationCodeSignInMethods({
      identifiers: [SignInIdentifier.Email],
      password: false,
      verify: true,
    });
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email]);
    await clearSsoConnectors();
  });

  it('should fail to sign in with email and passcode if the email domain is enabled for SSO only', async () => {
    const email = generateEmail('sso-sad-path.io');
    const user = await createUser({ primaryEmail: email });
    await updateSignInExperience({ singleSignOnEnabled: true });

    const { id } = await createSsoConnector({
      ...newOidcSsoConnectorPayload,
      connectorName: generateSsoConnectorName(),
      domains: ['sso-sad-path.io'],
    });

    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(sendVerificationCode, {
      email,
    });

    const { code: verificationCode } = await readConnectorMessage('Email');

    await expectRejects(
      client.send(patchInteractionIdentifiers, {
        email,
        verificationCode,
      }),
      {
        code: 'session.sso_enabled',
        status: 422,
      }
    );

    await deleteUser(user.id);
    await deleteSsoConnectorById(id);
  });

  it('should sign-in with email with SSO disabled', async () => {
    await updateSignInExperience({ singleSignOnEnabled: false });

    const { id } = await createSsoConnector({
      ...newOidcSsoConnectorPayload,
      connectorName: generateSsoConnectorName(),
      domains: ['sso-sign-in-happy-path.io'],
    });

    const email = generateEmail('sso-sign-in-happy-path.io');

    await happyPath(email);
    await deleteSsoConnectorById(id);
  });

  it('should sign-in with email with SSO enabled but no connector found', async () => {
    await updateSignInExperience({ singleSignOnEnabled: true });

    const { id } = await createSsoConnector({
      ...newOidcSsoConnectorPayload,
      connectorName: generateSsoConnectorName(),
      domains: ['sso-sign-in-happy-path.io'],
    });

    const email = generateEmail('happy-path.io');

    await happyPath(email);
    await deleteSsoConnectorById(id);
  });
});
