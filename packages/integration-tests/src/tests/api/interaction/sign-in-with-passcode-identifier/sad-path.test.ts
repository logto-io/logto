import { ConnectorType } from '@logto/connector-kit';
import { InteractionEvent, SignInMode } from '@logto/schemas';

import { suspendUser } from '#src/api/admin-user.js';
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
import { enableAllVerificationCodeSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import { generateEmail, generatePhone } from '#src/utils.js';

describe('Sign-in flow sad path using verification-code identifiers', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();
    await setSmsConnector();
    await enableAllVerificationCodeSignInMethods();
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await clearSsoConnectors();
  });

  it('should fail to sign in with passcode if sign-in mode is register only', async () => {
    await updateSignInExperience({ signInMode: SignInMode.Register });
    const client = await initClient();

    await expectRejects(
      client.send(putInteraction, {
        event: InteractionEvent.SignIn,
      }),
      {
        code: 'auth.forbidden',
        status: 403,
      }
    );

    // Reset
    await enableAllVerificationCodeSignInMethods();
  });

  it('should fail to sign in if related identifiers are not enabled', async () => {
    await updateSignInExperience({
      signIn: {
        methods: [],
      },
    });
    const client = await initClient();

    const {
      userProfile: { primaryEmail, primaryPhone },
    } = await generateNewUser({ primaryEmail: true, primaryPhone: true });

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    // Email
    await client.successSend(sendVerificationCode, {
      email: primaryEmail,
    });

    const { code: emailVerificationCode } = await readConnectorMessage('Email');

    await expectRejects(
      client.send(patchInteractionIdentifiers, {
        email: primaryEmail,
        verificationCode: emailVerificationCode,
      }),
      {
        code: 'user.sign_in_method_not_enabled',
        status: 422,
      }
    );

    // Phone
    await client.successSend(sendVerificationCode, {
      phone: primaryPhone,
    });

    const { code: phoneVerificationCode } = await readConnectorMessage('Sms');

    await expectRejects(
      client.send(patchInteractionIdentifiers, {
        phone: primaryPhone,
        verificationCode: phoneVerificationCode,
      }),
      {
        code: 'user.sign_in_method_not_enabled',
        status: 422,
      }
    );

    // Reset
    await enableAllVerificationCodeSignInMethods();
  });

  it('should fail to update sign in email identifier if verification code is incorrect or mismatch', async () => {
    const {
      userProfile: { primaryEmail },
    } = await generateNewUser({ primaryEmail: true });
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(sendVerificationCode, {
      email: primaryEmail,
    });

    const { code: verificationCode } = await readConnectorMessage('Email');

    await expectRejects(
      client.send(patchInteractionIdentifiers, {
        email: primaryEmail,
        verificationCode: `${verificationCode}-incorrect`,
      }),
      {
        code: 'verification_code.code_mismatch',
        status: 400,
      }
    );

    await expectRejects(
      client.send(patchInteractionIdentifiers, {
        email: `${primaryEmail}-incorrect`,
        verificationCode,
      }),
      {
        code: 'verification_code.email_mismatch',
        status: 400,
      }
    );
  });

  it('should fail to update sign in phone identifier if verification code is incorrect or mismatch', async () => {
    const {
      userProfile: { primaryPhone },
    } = await generateNewUser({ primaryPhone: true });
    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(sendVerificationCode, {
      phone: primaryPhone,
    });

    const { code: verificationCode } = await readConnectorMessage('Sms');

    await expectRejects(
      client.send(patchInteractionIdentifiers, {
        phone: primaryPhone,
        verificationCode: `${verificationCode}-incorrect`,
      }),
      {
        code: 'verification_code.code_mismatch',
        status: 400,
      }
    );

    await expectRejects(
      client.send(patchInteractionIdentifiers, {
        phone: `${primaryPhone}001`,
        verificationCode,
      }),
      {
        code: 'verification_code.phone_mismatch',
        status: 400,
      }
    );
  });

  it('should fail to sign in with email and passcode if related user is not exist', async () => {
    const notExistUserEmail = generateEmail();

    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(sendVerificationCode, {
      email: notExistUserEmail,
    });

    const { code: verificationCode } = await readConnectorMessage('Email');

    await client.successSend(patchInteractionIdentifiers, {
      email: notExistUserEmail,
      verificationCode,
    });

    await expectRejects(client.submitInteraction(), {
      code: 'user.user_not_exist',
      status: 404,
    });
  });

  it('should fail to sign in with phone and passcode if related user is not exist', async () => {
    const notExistUserPhone = generatePhone();

    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(sendVerificationCode, {
      phone: notExistUserPhone,
    });

    const { code: verificationCode } = await readConnectorMessage('Sms');

    await client.successSend(patchInteractionIdentifiers, {
      phone: notExistUserPhone,
      verificationCode,
    });

    await expectRejects(client.submitInteraction(), {
      code: 'user.user_not_exist',
      status: 404,
    });
  });

  it('should fail to sign in if related user is suspended', async () => {
    const {
      userProfile: { primaryEmail },
      user: { id: userId },
    } = await generateNewUser({ primaryEmail: true });

    await suspendUser(userId, true);

    const client = await initClient();
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await client.successSend(sendVerificationCode, {
      email: primaryEmail,
    });

    const { code: verificationCode } = await readConnectorMessage('Email');

    await client.successSend(patchInteractionIdentifiers, {
      email: primaryEmail,
      verificationCode,
    });

    await expectRejects(client.submitInteraction(), {
      code: 'user.suspended',
      status: 401,
    });
  });
});
