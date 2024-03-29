import { ConnectorType } from '@logto/connector-kit';
import { InteractionEvent } from '@logto/schemas';

import { suspendUser } from '#src/api/admin-user.js';
import {
  patchInteractionIdentifiers,
  putInteraction,
  putInteractionProfile,
  sendVerificationCode,
} from '#src/api/interaction.js';
import { initClient } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import { expectRejects, readConnectorMessage } from '#src/helpers/index.js';
import { generateNewUser, generateNewUserProfile } from '#src/helpers/user.js';
import { generatePassword } from '#src/utils.js';

describe('reset password flow sad path', () => {
  it('Should fail to reset password with email if related user is not exist', async () => {
    await setEmailConnector();

    const { primaryEmail } = generateNewUserProfile({ primaryEmail: true });

    const client = await initClient();

    await client.successSend(putInteraction, { event: InteractionEvent.ForgotPassword });
    await client.successSend(sendVerificationCode, {
      email: primaryEmail,
    });

    const { code: verificationCode } = await readConnectorMessage('Email');
    await client.successSend(patchInteractionIdentifiers, {
      email: primaryEmail,
      verificationCode,
    });

    await client.successSend(putInteractionProfile, { password: generatePassword() });
    await expectRejects(client.submitInteraction(), {
      code: 'user.user_not_exist',
      status: 404,
    });

    // Clear
    await clearConnectorsByTypes([ConnectorType.Email]);
  });

  it('Should fail to reset password with phone if related user is not exist', async () => {
    await setSmsConnector();

    const { primaryPhone } = generateNewUserProfile({ primaryPhone: true });

    const client = await initClient();

    await client.successSend(putInteraction, { event: InteractionEvent.ForgotPassword });
    await client.successSend(sendVerificationCode, {
      phone: primaryPhone,
    });

    const { code: verificationCode } = await readConnectorMessage('Sms');
    await client.successSend(patchInteractionIdentifiers, {
      phone: primaryPhone,
      verificationCode,
    });

    await client.successSend(putInteractionProfile, { password: generatePassword() });
    await expectRejects(client.submitInteraction(), {
      code: 'user.user_not_exist',
      status: 404,
    });

    // Clear
    await clearConnectorsByTypes([ConnectorType.Sms]);
  });

  it('Should fail to reset password if related user is suspended', async () => {
    await setSmsConnector();

    const {
      user,
      userProfile: { primaryPhone },
    } = await generateNewUser({
      primaryPhone: true,
      password: true,
    });

    await suspendUser(user.id, true);

    const client = await initClient();

    await client.successSend(putInteraction, { event: InteractionEvent.ForgotPassword });
    await client.successSend(sendVerificationCode, {
      phone: primaryPhone,
    });

    const { code: verificationCode } = await readConnectorMessage('Sms');
    await client.successSend(patchInteractionIdentifiers, {
      phone: primaryPhone,
      verificationCode,
    });

    await client.successSend(putInteractionProfile, { password: generatePassword() });
    await expectRejects(client.submitInteraction(), {
      code: 'user.suspended',
      status: 401,
    });

    // Clear
    await clearConnectorsByTypes([ConnectorType.Sms]);
  });
});
