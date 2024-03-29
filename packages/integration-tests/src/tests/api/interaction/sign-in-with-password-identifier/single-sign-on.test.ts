import { ConnectorType, InteractionEvent } from '@logto/schemas';

import { createUser, deleteUser } from '#src/api/admin-user.js';
import { putInteraction } from '#src/api/interaction.js';
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
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateEmail, generatePassword, generateSsoConnectorName } from '#src/utils.js';

const happyPath = async (email: string) => {
  const password = generatePassword();
  const user = await createUser({ primaryEmail: email, password });

  const client = await initClient();

  await client.successSend(putInteraction, {
    event: InteractionEvent.SignIn,
    identifier: {
      email,
      password,
    },
  });

  const { redirectTo } = await client.submitInteraction();

  await processSession(client, redirectTo);
  await logoutClient(client);

  await deleteUser(user.id);
};

describe('test sign-in with email passcode identifier with SSO feature', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();
    await setSmsConnector();
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await clearSsoConnectors();
  });

  it('should allow sign-in with email and password with SSO disabled', async () => {
    await updateSignInExperience({ singleSignOnEnabled: false });
    const email = generateEmail('sso-password-happy-path.io');

    const { id } = await createSsoConnector({
      ...newOidcSsoConnectorPayload,
      connectorName: generateSsoConnectorName(),
      domains: ['sso-password-happy-path.io'],
    });

    await happyPath(email);
    await deleteSsoConnectorById(id);
  });

  it('should allow sign-in with email and password with unmatched SSO connector domains', async () => {
    await updateSignInExperience({ singleSignOnEnabled: true });
    const email = generateEmail('happy-path.io');

    const { id } = await createSsoConnector({
      ...newOidcSsoConnectorPayload,
      connectorName: generateSsoConnectorName(),
      domains: ['sso-password-happy-path.io'],
    });

    await happyPath(email);
    await deleteSsoConnectorById(id);
  });

  it('Should fail to sign-in with email and password if the email domain is enabled for SSO only', async () => {
    const password = generatePassword();
    const email = generateEmail('sso-sad-path.io');
    const user = await createUser({ primaryEmail: email, password });

    await createSsoConnector({
      ...newOidcSsoConnectorPayload,
      connectorName: generateSsoConnectorName(),
      domains: ['sso-sad-path.io'],
    });

    const client = await initClient();

    await expectRejects(
      client.send(putInteraction, {
        event: InteractionEvent.SignIn,
        identifier: { email, password },
      }),
      {
        code: 'session.sso_enabled',
        status: 422,
      }
    );
    await deleteUser(user.id);
  });
});
