import { ConnectorType } from '@logto/connector-kit';
import {
  InteractionEvent,
  SignInIdentifier,
  type VerificationCodeIdentifier,
} from '@logto/schemas';

import { initExperienceClient } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import {
  successfullySendVerificationCode,
  successfullyVerifyVerificationCode,
} from '#src/helpers/experience/verification-code.js';
import { expectRejects } from '#src/helpers/index.js';

describe('Verification code verification APIs', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
  });

  const identifiers: VerificationCodeIdentifier[] = [
    {
      type: SignInIdentifier.Email,
      value: 'foo@logto.io',
    },
    {
      type: SignInIdentifier.Phone,
      value: '+1234567890',
    },
  ];

  describe.each(identifiers)('Verification code verification APIs for %p', ({ type, value }) => {
    it(`should throw an 501 error if the ${type} connector is not set`, async () => {
      const client = await initExperienceClient();

      await expectRejects(
        client.sendVerificationCode({
          interactionEvent: InteractionEvent.SignIn,
          identifier: {
            type,
            value,
          },
        }),
        {
          code: 'connector.not_found',
          status: 501,
        }
      );

      await (type === 'email' ? setEmailConnector() : setSmsConnector());
    });

    it(`should send a verification code to the ${type} successfully`, async () => {
      const client = await initExperienceClient();

      await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier: {
          type,
          value,
        },
      });
    });

    it('should throw a 404 error if the verificationId is invalid', async () => {
      const client = await initExperienceClient();

      const { code } = await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier: {
          type,
          value,
        },
      });

      await expectRejects(
        client.verifyVerificationCode({
          code,
          identifier: {
            type,
            value,
          },
          verificationId: 'invalid_verification_id',
        }),
        {
          code: 'session.verification_session_not_found',
          status: 404,
        }
      );
    });

    it('should throw a 404 error if the verification record is overwrote by a concurrent verification request', async () => {
      const client = await initExperienceClient();

      const { verificationId, code } = await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier: {
          type,
          value,
        },
      });

      // Resend and recreate the verification record
      await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier: {
          type,
          value,
        },
      });

      await expectRejects(
        client.verifyVerificationCode({
          code,
          identifier: {
            type,
            value,
          },
          verificationId,
        }),
        {
          code: 'session.verification_session_not_found',
          status: 404,
        }
      );
    });

    it('should throw a 400 error if the identifier is different', async () => {
      const client = await initExperienceClient();

      const { code, verificationId } = await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier: {
          type,
          value,
        },
      });

      await expectRejects(
        client.verifyVerificationCode({
          code,
          identifier: {
            type,
            value: 'invalid_identifier',
          },
          verificationId,
        }),
        {
          code: `verification_code.${type}_mismatch`,
          status: 400,
        }
      );
    });

    it('should throw a 400 error if the code is mismatched', async () => {
      const client = await initExperienceClient();

      const { verificationId } = await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier: {
          type,
          value,
        },
      });

      await expectRejects(
        client.verifyVerificationCode({
          code: 'invalid_code',
          identifier: {
            type,
            value,
          },
          verificationId,
        }),
        {
          code: 'verification_code.code_mismatch',
          status: 400,
        }
      );
    });

    it('should verify the verification code successfully', async () => {
      const client = await initExperienceClient();

      const { code, verificationId } = await successfullySendVerificationCode(client, {
        interactionEvent: InteractionEvent.SignIn,
        identifier: {
          type,
          value,
        },
      });

      await successfullyVerifyVerificationCode(client, {
        code,
        identifier: {
          type,
          value,
        },
        verificationId,
      });
    });
  });
});
