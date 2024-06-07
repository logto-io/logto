import { InteractionEvent, MfaFactor, adminTenantId } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import type Provider from 'oidc-provider';

import { mockWebAuthnBind } from '#src/__mocks__/mfa-verification.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type {
  Identifier,
  VerifiedRegisterInteractionResult,
  VerifiedSignInInteractionResult,
} from '../types/index.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const getLogtoConnectorById = jest
  .fn()
  .mockResolvedValue({ metadata: { target: 'logto' }, dbEntry: { syncProfile: true } });

const { assignInteractionResults } = mockEsm('#src/libraries/session.js', () => ({
  assignInteractionResults: jest.fn(),
}));

mockEsm('#src/libraries/user.js', () => ({
  encryptUserPassword: jest.fn().mockResolvedValue({
    passwordEncrypted: 'passwordEncrypted',
    passwordEncryptionMethod: 'plain',
  }),
}));

mockEsm('@logto/shared', () => ({
  generateStandardId: jest.fn().mockReturnValue('uid'),
}));

mockEsm('#src/utils/tenant.js', () => ({
  getTenantId: () => [adminTenantId],
}));

const userQueries = {
  findUserById: jest.fn().mockResolvedValue({
    identities: { google: { userId: 'googleId', details: {} } },
    mfaVerifications: [],
  }),
  updateUserById: jest.fn(),
  hasActiveUsers: jest.fn().mockResolvedValue(true),
  hasUserWithEmail: jest.fn().mockResolvedValue(false),
  hasUserWithPhone: jest.fn().mockResolvedValue(false),
};

const { hasActiveUsers, updateUserById } = userQueries;

const userLibraries = { generateUserId: jest.fn().mockResolvedValue('uid'), insertUser: jest.fn() };
const { generateUserId, insertUser } = userLibraries;

const submitInteraction = await pickDefault(import('./submit-interaction.js'));
const now = Date.now();

jest.useFakeTimers().setSystemTime(now);

describe('submit action', () => {
  const tenant = new MockTenant(
    undefined,
    { users: userQueries, signInExperiences: { updateDefaultSignInExperience: jest.fn() } },
    { getLogtoConnectorById },
    { users: userLibraries }
  );
  const ctx = {
    ...createContextWithRouteParameters(),
    ...createMockLogContext(),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    interactionDetails: { params: {} } as Awaited<ReturnType<Provider['interactionDetails']>>,
    assignInteractionHookResult: jest.fn(),
    assignDataHookContext: jest.fn(),
  };
  const profile = {
    username: 'username',
    password: 'password',
    phone: '123456',
    email: 'email@logto.io',
    connectorId: 'logto',
  };

  const userInfo = {
    id: 'foo',
    name: 'foo_social',
    avatar: 'avatar',
    email: 'email@socail.com',
    phone: '123123',
  };

  const identifiers: Identifier[] = [
    {
      key: 'social',
      connectorId: 'logto',
      userInfo,
    },
  ];

  const upsertProfile = {
    username: 'username',
    primaryPhone: '123456',
    primaryEmail: 'email@logto.io',
    passwordEncrypted: 'passwordEncrypted',
    passwordEncryptionMethod: 'plain',
    identities: {
      logto: { userId: userInfo.id, details: userInfo },
    },
    name: userInfo.name,
    avatar: userInfo.avatar,
    lastSignInAt: now,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register with bindMfas', () => {
    it('should handle totp', async () => {
      const interaction: VerifiedRegisterInteractionResult = {
        event: InteractionEvent.Register,
        profile,
        identifiers,
        bindMfas: [{ type: MfaFactor.TOTP, secret: 'secret' }],
      };

      await submitInteraction(interaction, ctx, tenant);
      expect(generateUserId).toBeCalled();
      expect(hasActiveUsers).not.toBeCalled();

      expect(insertUser).toBeCalledWith(
        {
          id: 'uid',
          mfaVerifications: [
            {
              type: MfaFactor.TOTP,
              key: 'secret',
              id: 'uid',
              createdAt: new Date(now).toISOString(),
            },
          ],
          ...upsertProfile,
        },
        ['user']
      );
    });

    it('should handle webauthn', async () => {
      const interaction: VerifiedRegisterInteractionResult = {
        event: InteractionEvent.Register,
        profile,
        identifiers,
        bindMfas: [mockWebAuthnBind],
        pendingAccountId: 'id',
      };

      await submitInteraction(interaction, ctx, tenant);
      expect(generateUserId).not.toBeCalled();
      expect(hasActiveUsers).not.toBeCalled();

      expect(insertUser).toBeCalledWith(
        {
          id: 'id',
          mfaVerifications: [
            {
              ...mockWebAuthnBind,
              id: 'uid',
              createdAt: new Date(now).toISOString(),
            },
          ],
          ...upsertProfile,
        },
        ['user']
      );
    });

    it('should handle backup code', async () => {
      const interaction: VerifiedRegisterInteractionResult = {
        event: InteractionEvent.Register,
        profile,
        identifiers,
        bindMfas: [{ type: MfaFactor.BackupCode, codes: ['code1', 'code2'] }],
      };

      await submitInteraction(interaction, ctx, tenant);
      expect(generateUserId).toBeCalled();
      expect(hasActiveUsers).not.toBeCalled();

      expect(insertUser).toBeCalledWith(
        {
          id: 'uid',
          mfaVerifications: [
            {
              type: MfaFactor.BackupCode,
              codes: [{ code: 'code1' }, { code: 'code2' }],
              id: 'uid',
              createdAt: new Date(now).toISOString(),
            },
          ],
          ...upsertProfile,
        },
        ['user']
      );
    });
  });

  describe('sign in with bindMfa', () => {
    it('should handle totp', async () => {
      getLogtoConnectorById.mockResolvedValueOnce({
        metadata: { target: 'logto' },
        dbEntry: { syncProfile: false },
      });
      const interaction: VerifiedSignInInteractionResult = {
        event: InteractionEvent.SignIn,
        accountId: 'foo',
        identifiers,
        bindMfas: [
          {
            type: MfaFactor.TOTP,
            secret: 'secret',
          },
        ],
      };

      await submitInteraction(interaction, ctx, tenant);

      expect(getLogtoConnectorById).toBeCalledWith('logto');

      expect(updateUserById).toBeCalledWith('foo', {
        mfaVerifications: [
          {
            type: MfaFactor.TOTP,
            key: 'secret',
            id: 'uid',
            createdAt: new Date(now).toISOString(),
          },
        ],
        lastSignInAt: now,
      });
      expect(assignInteractionResults).toBeCalledWith(ctx, tenant.provider, {
        login: { accountId: 'foo' },
      });
    });

    it('should handle webauthn', async () => {
      getLogtoConnectorById.mockResolvedValueOnce({
        metadata: { target: 'logto' },
        dbEntry: { syncProfile: false },
      });
      const interaction: VerifiedSignInInteractionResult = {
        event: InteractionEvent.SignIn,
        accountId: 'foo',
        identifiers,
        bindMfas: [mockWebAuthnBind],
      };

      await submitInteraction(interaction, ctx, tenant);

      expect(getLogtoConnectorById).toBeCalledWith('logto');

      expect(updateUserById).toBeCalledWith('foo', {
        mfaVerifications: [
          {
            id: 'uid',
            createdAt: new Date(now).toISOString(),
            ...mockWebAuthnBind,
          },
        ],
        lastSignInAt: now,
      });
      expect(assignInteractionResults).toBeCalledWith(ctx, tenant.provider, {
        login: { accountId: 'foo' },
      });
    });

    it('should handle backup code', async () => {
      getLogtoConnectorById.mockResolvedValueOnce({
        metadata: { target: 'logto' },
        dbEntry: { syncProfile: false },
      });
      const interaction: VerifiedSignInInteractionResult = {
        event: InteractionEvent.SignIn,
        accountId: 'foo',
        identifiers,
        bindMfas: [
          {
            type: MfaFactor.BackupCode,
            codes: ['code'],
          },
        ],
      };

      await submitInteraction(interaction, ctx, tenant);

      expect(getLogtoConnectorById).toBeCalledWith('logto');

      expect(updateUserById).toBeCalledWith('foo', {
        mfaVerifications: [
          {
            type: MfaFactor.BackupCode,
            codes: [{ code: 'code' }],
            id: 'uid',
            createdAt: new Date(now).toISOString(),
          },
        ],
        lastSignInAt: now,
      });
      expect(assignInteractionResults).toBeCalledWith(ctx, tenant.provider, {
        login: { accountId: 'foo' },
      });
    });
  });
});
