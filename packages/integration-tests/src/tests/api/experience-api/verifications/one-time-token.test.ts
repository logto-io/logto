import { InteractionEvent, OneTimeTokenStatus, SignInIdentifier } from '@logto/schemas';

import {
  createOneTimeToken,
  deleteOneTimeTokenById,
  getOneTimeTokenById,
} from '#src/api/one-time-token.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { expectRejects } from '#src/helpers/index.js';
import { waitFor } from '#src/utils.js';

describe('One-time token verification APIs', () => {
  it('should successfully verify one-time token', async () => {
    const client = await initExperienceClient();

    const oneTimeToken = await createOneTimeToken({
      email: 'foo@logto.io',
    });

    const { verificationId } = await client.verifyOneTimeToken({
      token: oneTimeToken.token,
      identifier: {
        type: SignInIdentifier.Email,
        value: 'foo@logto.io',
      },
    });

    expect(verificationId).toBeTruthy();
  });

  it('should throw token_consumed error when token is already consumed', async () => {
    const client = await initExperienceClient();

    const oneTimeToken = await createOneTimeToken({
      email: 'foo@logto.io',
    });

    await client.verifyOneTimeToken({
      token: oneTimeToken.token,
      identifier: {
        type: SignInIdentifier.Email,
        value: 'foo@logto.io',
      },
    });

    await expectRejects(
      client.verifyOneTimeToken({
        token: oneTimeToken.token,
        identifier: {
          type: SignInIdentifier.Email,
          value: 'foo@logto.io',
        },
      }),
      {
        code: 'one_time_token.token_consumed',
        status: 400,
      }
    );
  });

  it('should throw token_expired error when token is expired', async () => {
    const client = await initExperienceClient();

    const oneTimeToken = await createOneTimeToken({
      email: 'foo@logto.io',
      expiresIn: 1,
    });

    await waitFor(2000);

    await expectRejects(
      client.verifyOneTimeToken({
        token: oneTimeToken.token,
        identifier: {
          type: SignInIdentifier.Email,
          value: 'foo@logto.io',
        },
      }),
      {
        code: 'one_time_token.token_expired',
        status: 400,
      }
    );
  });

  it('should throw token_not_found error when token is not found', async () => {
    const client = await initExperienceClient();

    await expectRejects(
      client.verifyOneTimeToken({
        token: 'invalid_token',
        identifier: {
          type: SignInIdentifier.Email,
          value: 'foo@logto.io',
        },
      }),
      {
        code: 'one_time_token.token_not_found',
        status: 404,
      }
    );
  });

  it('should throw email_mismatch error when email is mismatched', async () => {
    const client = await initExperienceClient();

    const oneTimeToken = await createOneTimeToken({
      email: 'foo@logto.io',
    });

    await expectRejects(
      client.verifyOneTimeToken({
        token: oneTimeToken.token,
        identifier: {
          type: SignInIdentifier.Email,
          value: 'bar@logto.io',
        },
      }),
      {
        code: 'one_time_token.email_mismatch',
        status: 400,
      }
    );
  });

  it('should throw interaction_event_mismatch error when token context does not match current interaction event', async () => {
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.SignIn,
    });

    const oneTimeToken = await createOneTimeToken({
      email: 'foo@logto.io',
      context: {
        interactionEvent: InteractionEvent.ForgotPassword,
      },
    });

    try {
      await expectRejects(
        client.verifyOneTimeToken({
          token: oneTimeToken.token,
          identifier: {
            type: SignInIdentifier.Email,
            value: 'foo@logto.io',
          },
        }),
        {
          code: 'one_time_token.interaction_event_mismatch',
          status: 400,
        }
      );

      await expect(getOneTimeTokenById(oneTimeToken.id)).resolves.toMatchObject({
        status: OneTimeTokenStatus.Active,
      });
    } finally {
      await deleteOneTimeTokenById(oneTimeToken.id);
    }
  });
});
