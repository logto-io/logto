import { InteractionEvent, MfaFactor } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';
import type Provider from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type { IdentifierVerifiedInteractionResult } from '../types/index.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const { validateTotpToken } = mockEsm('../utils/totp-validation.js', () => ({
  validateTotpToken: jest.fn().mockReturnValue(true),
}));

const { bindMfaPayloadVerification } = await import('./mfa-payload-verification.js');

describe('bindMfaPayloadVerification', () => {
  const baseCtx = {
    ...createContextWithRouteParameters(),
    ...createMockLogContext(),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    interactionDetails: {} as Awaited<ReturnType<Provider['interactionDetails']>>,
  };

  const interaction: IdentifierVerifiedInteractionResult = {
    event: InteractionEvent.SignIn,
    identifiers: [{ key: 'accountId', value: 'foo' }],
    accountId: 'foo',
  };

  describe('totp', () => {
    it('should return result of BindMfa', async () => {
      await expect(
        bindMfaPayloadVerification(
          baseCtx,
          { type: MfaFactor.TOTP, code: '123456' },
          {
            ...interaction,
            pendingMfa: {
              type: MfaFactor.TOTP,
              secret: 'secret',
            },
          }
        )
      ).resolves.toMatchObject({
        type: MfaFactor.TOTP,
        secret: 'secret',
      });

      expect(validateTotpToken).toHaveBeenCalled();
    });

    it('should reject when pendingMfa is missing', async () => {
      await expect(
        bindMfaPayloadVerification(baseCtx, { type: MfaFactor.TOTP, code: '123456' }, interaction)
      ).rejects.toEqual(new RequestError('session.mfa.pending_info_not_found'));
    });

    it('should reject when code is invalid', async () => {
      validateTotpToken.mockReturnValueOnce(false);

      await expect(
        bindMfaPayloadVerification(
          baseCtx,
          { type: MfaFactor.TOTP, code: '123456' },
          {
            ...interaction,
            pendingMfa: {
              type: MfaFactor.TOTP,
              secret: 'secret',
            },
          }
        )
      ).rejects.toEqual(new RequestError('session.mfa.invalid_totp_code'));
    });
  });
});
