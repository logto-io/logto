import { SignInIdentifier, InteractionEvent, ConnectorType } from '@logto/schemas';

import { putInteraction } from '#src/api/interaction.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { initClient } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  enableAllVerificationCodeSignInMethods,
} from '#src/helpers/sign-in-experience.js';
import { generateEmail, generatePhone } from '#src/utils.js';

/**
 * Note: These test cases are designed to cover exceptional scenarios of API calls that
 * cannot be covered within the auth flow.
 */
describe('PUT /interaction', () => {
  /**
   * Note: only test email & phone identifier here, since other cases are covered in the auth flow.
   */
  it('Should fail to create a sign-in interaction with identifiers when related sign-in methods are not enabled', async () => {
    // Init a valid sign-in experience config
    await enableAllPasswordSignInMethods();

    // Remove email & phone identifier from sign-in methods
    await updateSignInExperience({
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Username,
            password: true,
            verificationCode: false,
            isPasswordPrimary: true,
          },
        ],
      },
    });

    const client = await initClient();

    // Email
    await expectRejects(
      client.send(putInteraction, {
        event: InteractionEvent.SignIn,
        identifier: {
          email: generateEmail(),
          verificationCode: '123456',
        },
      }),
      {
        code: 'user.sign_in_method_not_enabled',
        status: 422,
      }
    );

    // Phone
    await expectRejects(
      client.send(putInteraction, {
        event: InteractionEvent.SignIn,
        identifier: {
          phone: generatePhone(),
          verificationCode: '123456',
        },
      }),
      {
        code: 'user.sign_in_method_not_enabled',
        status: 422,
      }
    );

    // Reset
    await enableAllPasswordSignInMethods();
  });

  /**
   * Note: only test email & phone identifier here, since other cases are covered in the auth flow.
   */
  it('Should fail to create a register interaction with profile when related sign-up identifiers are not enabled', async () => {
    // Init a valid sign-in experience config
    await enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    });

    const client = await initClient();

    // Email
    await expectRejects(
      client.send(putInteraction, {
        event: InteractionEvent.Register,
        profile: {
          email: generateEmail(),
        },
      }),
      {
        code: 'user.sign_in_method_not_enabled',
        status: 422,
      }
    );

    // Phone
    await expectRejects(
      client.send(putInteraction, {
        event: InteractionEvent.Register,
        profile: {
          phone: generatePhone(),
        },
      }),
      {
        code: 'user.sign_in_method_not_enabled',
        status: 422,
      }
    );

    // Reset
    await enableAllPasswordSignInMethods();
  });

  it('Should fail to create an interaction when verification code is provided in the identifier but failed to verified', async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();
    await setSmsConnector();
    await enableAllVerificationCodeSignInMethods();

    const client = await initClient();
    // Email
    await expectRejects(
      client.send(putInteraction, {
        event: InteractionEvent.SignIn,
        identifier: {
          email: generateEmail(),
          verificationCode: '123456',
        },
      }),
      {
        code: 'verification_code.not_found',
        status: 400,
      }
    );

    // Email
    await expectRejects(
      client.send(putInteraction, {
        event: InteractionEvent.SignIn,
        identifier: {
          phone: generatePhone(),
          verificationCode: '123456',
        },
      }),
      {
        code: 'verification_code.not_found',
        status: 400,
      }
    );

    // Clear
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
  });

  it('Should fail to create an interaction when connector id and connector data is provided but failed to verified', async () => {
    const client = await initClient();
    await expectRejects(
      client.send(putInteraction, {
        event: InteractionEvent.SignIn,
        identifier: {
          connectorId: 'fake_connector_id',
          connectorData: {
            email: generateEmail(),
          },
        },
      }),
      {
        code: 'session.invalid_connector_id',
        status: 422,
      }
    );
  });

  it('Should fail to create an interaction when connector id is provided but failed to verified', async () => {
    const client = await initClient();
    await expectRejects(
      client.send(putInteraction, {
        event: InteractionEvent.SignIn,
        identifier: {
          connectorId: 'fake_connector_id',
          email: generateEmail(),
        },
      }),
      {
        code: 'session.connector_session_not_found',
        status: 400,
      }
    );
  });
});
