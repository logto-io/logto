import { InteractionEvent } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type { SignInInteractionResult } from '../types/index.js';

const { jest } = import.meta;
const { mockEsmDefault, mockEsmWithActual } = createMockUtils(jest);

const { storeInteractionResult } = await mockEsmWithActual('../utils/interaction.js', () => ({
  storeInteractionResult: jest.fn(),
}));
const verifyUserAccount = mockEsmDefault('./user-identity-verification.js', () => jest.fn());

const verifyIdentifier = await pickDefault(import('./identifier-verification.js'));

describe('verifyIdentifier', () => {
  const ctx = {
    ...createContextWithRouteParameters(),
    ...createMockLogContext(),
  };
  const tenant = new MockTenant();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the interaction record if the event is register', async () => {
    const interactionRecord = {
      event: InteractionEvent.Register,
    };

    const result = await verifyIdentifier(ctx, tenant, interactionRecord);

    expect(result).toBe(interactionRecord);
    expect(verifyUserAccount).not.toBeCalled();
    expect(storeInteractionResult).not.toBeCalled();
  });

  it('should return and assign the verified result to the interaction record if the event is sign in', async () => {
    const interactionRecord: SignInInteractionResult = {
      event: InteractionEvent.SignIn,
      identifiers: [{ key: 'emailVerified', value: 'email@logto.io' }],
    };

    const verifiedRecord = {
      ...interactionRecord,
      accountId: 'foo',
    };

    verifyUserAccount.mockResolvedValue(verifiedRecord);

    const result = await verifyIdentifier(ctx, tenant, interactionRecord);

    expect(result).toBe(verifiedRecord);
    expect(verifyUserAccount).toBeCalledWith(tenant, interactionRecord);
    expect(storeInteractionResult).toBeCalledWith(verifiedRecord, ctx, tenant.provider);
  });
});
