import { ConnectorType, InteractionEvent, SignInMode } from '@logto/schemas';

import {
  patchInteractionIdentifiers,
  putInteraction,
  sendVerificationCode,
} from '#src/api/interaction.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { initClient } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  clearSsoConnectors,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import { expectRejects, readConnectorMessage } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile } from '#src/helpers/user.js';
import { generatePassword, generateUsername } from '#src/utils.js';

describe('Register with identifiers sad path', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();
    await setSmsConnector();
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await clearSsoConnectors();
  });

  it('should fail to register if sign-in mode is sign-in only', async () => {
    await updateSignInExperience({ signInMode: SignInMode.SignIn });
    const client = await initClient();

    await expectRejects(
      client.send(putInteraction, {
        event: InteractionEvent.Register,
      }),
      {
        code: 'auth.forbidden',
        status: 403,
      }
    );

    // Reset
    await updateSignInExperience({ signInMode: SignInMode.SignInAndRegister });
  });

  describe('should fail to register with identifiers if sign-up settings are not enabled', () => {
    beforeAll(async () => {
      // This function call will disable all sign-up settings by default
      await enableAllPasswordSignInMethods();
    });

    it('should fail to register with username and password', async () => {
      const client = await initClient();

      await expectRejects(
        client.send(putInteraction, {
          event: InteractionEvent.Register,
          profile: {
            username: generateUsername(),
            password: generatePassword(),
          },
        }),
        {
          code: 'user.sign_in_method_not_enabled',
          status: 422,
        }
      );
    });

    it('should fail to register with email', async () => {
      await setEmailConnector();
      const { primaryEmail } = generateNewUserProfile({ primaryEmail: true });
      const client = await initClient();

      await client.successSend(putInteraction, {
        event: InteractionEvent.Register,
      });

      await client.successSend(sendVerificationCode, {
        email: primaryEmail,
      });

      const { code: verificationCode } = await readConnectorMessage('Email');

      await expectRejects(
        client.send(patchInteractionIdentifiers, {
          email: primaryEmail,
          verificationCode,
        }),
        {
          code: 'user.sign_in_method_not_enabled',
          status: 422,
        }
      );

      // Clear
      await clearConnectorsByTypes([ConnectorType.Email]);
    });

    it('should fail to register with phone', async () => {
      await setSmsConnector();

      const { primaryPhone } = generateNewUserProfile({ primaryPhone: true });
      const client = await initClient();

      await client.successSend(putInteraction, {
        event: InteractionEvent.Register,
      });

      await client.successSend(sendVerificationCode, {
        phone: primaryPhone,
      });

      const { code: verificationCode } = await readConnectorMessage('Sms');

      await expectRejects(
        client.send(patchInteractionIdentifiers, {
          phone: primaryPhone,
          verificationCode,
        }),
        {
          code: 'user.sign_in_method_not_enabled',
          status: 422,
        }
      );

      // Clear
      await clearConnectorsByTypes([ConnectorType.Sms]);
    });
  });
});
