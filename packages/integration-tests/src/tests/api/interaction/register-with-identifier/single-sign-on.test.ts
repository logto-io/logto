import { ConnectorType, InteractionEvent, SignInIdentifier } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import {
  putInteraction,
  sendVerificationCode,
  patchInteractionIdentifiers,
  putInteractionProfile,
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
  const client = await initClient();

  await client.successSend(putInteraction, {
    event: InteractionEvent.Register,
  });

  await client.successSend(sendVerificationCode, {
    email,
  });

  const verificationCodeRecord = await readConnectorMessage('Email');

  expect(verificationCodeRecord).toMatchObject({
    address: email,
    type: InteractionEvent.Register,
  });

  const { code } = verificationCodeRecord;

  await client.successSend(patchInteractionIdentifiers, {
    email,
    verificationCode: code,
  });

  await client.successSend(putInteractionProfile, {
    email,
  });

  const { redirectTo } = await client.submitInteraction();

  const id = await processSession(client, redirectTo);
  await logoutClient(client);
  await deleteUser(id);
};

describe('test register with email with SSO feature', () => {
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

  it('should register with email with SSO disabled', async () => {
    await updateSignInExperience({ singleSignOnEnabled: false });
    const email = generateEmail('sso-register-happy-path.io');

    const { id } = await createSsoConnector({
      ...newOidcSsoConnectorPayload,
      connectorName: generateSsoConnectorName(),
      domains: ['sso-register-happy-path.io'],
    });

    await happyPath(email);

    await deleteSsoConnectorById(id);
  });

  it('should register with email with SSO enabled but no connector found', async () => {
    await updateSignInExperience({ singleSignOnEnabled: true });
    const email = generateEmail('sso-register-happy-path.io');

    const { id } = await createSsoConnector({
      ...newOidcSsoConnectorPayload,
      connectorName: generateSsoConnectorName(),
      domains: ['happy.io'],
    });

    await happyPath(email);

    await deleteSsoConnectorById(id);
  });

  it('Should fail to register with email if email domain is enabled for SSO only', async () => {
    await updateSignInExperience({ singleSignOnEnabled: true });
    const email = generateEmail('sso-register-sad-path.io');

    await createSsoConnector({
      ...newOidcSsoConnectorPayload,
      connectorName: generateSsoConnectorName(),
      domains: ['sso-register-sad-path.io'],
    });

    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.Register,
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
  });
});
