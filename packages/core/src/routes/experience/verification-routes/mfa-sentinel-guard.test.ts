import { AdditionalIdentifier, SentinelActivityAction, VerificationType } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';
import { z } from 'zod';

import { mockUser } from '#src/__mocks__/user.js';
import { EnvSet } from '#src/env-set/index.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

type Next = () => Promise<unknown>;
type RouteHandler = (ctx: Record<string, unknown>, next: Next) => Promise<unknown>;
type RouterLike = {
  post: jest.Mock<void, [string, ...unknown[]]>;
};

const passThroughMiddleware = async (_ctx: unknown, next: Next) => next();
async function resolveVoid(): Promise<void> {
  await Promise.resolve();
}

const withSentinel = jest.fn(
  async (_options: unknown, verificationPromise: Promise<unknown>) => verificationPromise
);

mockEsm('#src/middleware/koa-guard.js', () => ({
  default: () => passThroughMiddleware,
}));

mockEsm('../middleware/koa-experience-verifications-audit-log.js', () => ({
  default: () => passThroughMiddleware,
}));

mockEsm('../classes/libraries/sentinel-guard.js', () => ({
  withSentinel,
}));

const totpVerificationRecord = {
  id: 'totp-verification-id',
  verifyUserExistingTotp: jest.fn().mockImplementation(resolveVoid),
};

const totpVerificationRecordDataGuard = z.object({
  id: z.string(),
  type: z.literal(VerificationType.TOTP),
  userId: z.string(),
  verified: z.boolean(),
});

mockEsm('../classes/verifications/totp-verification.js', () => ({
  TotpVerification: {
    create: jest.fn(() => totpVerificationRecord),
  },
  totpVerificationRecordDataGuard,
  sanitizedTotpVerificationRecordDataGuard: totpVerificationRecordDataGuard,
}));

const backupCodeVerificationRecord = {
  id: 'backup-code-verification-id',
  verify: jest.fn().mockImplementation(resolveVoid),
};

const backupCodeVerificationRecordDataGuard = z.object({
  id: z.string(),
  type: z.literal(VerificationType.BackupCode),
  userId: z.string(),
});

mockEsm('../classes/verifications/backup-code-verification.js', () => ({
  BackupCodeVerification: {
    create: jest.fn(() => backupCodeVerificationRecord),
  },
  backupCodeVerificationRecordDataGuard,
  sanitizedBackupCodeVerificationRecordDataGuard: backupCodeVerificationRecordDataGuard,
}));

const webAuthnVerificationRecord = {
  id: 'webauthn-verification-id',
  userId: mockUser.id,
  verifyWebAuthnAuthentication: jest.fn().mockImplementation(resolveVoid),
};

mockEsm('../classes/verifications/web-authn-verification.js', () => ({
  WebAuthnVerification: {
    create: jest.fn(() => webAuthnVerificationRecord),
  },
  SignInPasskeyVerification: {
    create: jest.fn(),
  },
}));

const { default: totpVerificationRoutes } = await import('./totp-verification.js');
const { default: backupCodeVerificationRoutes } = await import('./backup-code-verification.js');
const { default: webAuthnVerificationRoute } = await import('./web-authn-verification.js');

const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

const createRouter = (): RouterLike => ({
  post: jest.fn<void, [string, ...unknown[]]>(),
});

const getRouteHandler = (router: RouterLike, path: string): RouteHandler => {
  const route = router.post.mock.calls.find(([registeredPath]) => registeredPath === path);

  if (!route) {
    throw new TypeError(`Route ${path} is not registered`);
  }

  const handler = route.at(-1);

  if (typeof handler !== 'function') {
    throw new TypeError(`Route ${path} handler is invalid`);
  }

  return handler as RouteHandler;
};

describe('MFA verification routes sentinel guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    totpVerificationRecord.verifyUserExistingTotp.mockImplementation(resolveVoid);
    backupCodeVerificationRecord.verify.mockImplementation(resolveVoid);
    webAuthnVerificationRecord.verifyWebAuthnAuthentication.mockImplementation(resolveVoid);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = false;
  });

  afterAll(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled =
      originalIsDevFeaturesEnabled;
  });

  it('applies sentinel to TOTP MFA verification even when dev features are disabled', async () => {
    const router = createRouter();

    totpVerificationRoutes(
      router as never,
      {
        libraries: {},
        queries: {},
        sentinel: {},
      } as never
    );

    const handler = getRouteHandler(router, '/experience/verification/totp/verify');
    const ctx = {
      experienceInteraction: {
        identifiedUserId: mockUser.id,
        setVerificationRecord: jest.fn(),
        save: jest.fn().mockImplementation(resolveVoid),
      },
      verificationAuditLog: {
        append: jest.fn(),
      },
      guard: {
        body: {
          code: '123456',
        },
      },
    };

    await handler(ctx, jest.fn().mockImplementation(resolveVoid));

    expect(withSentinel).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SentinelActivityAction.MfaTotp,
        identifier: {
          type: AdditionalIdentifier.UserId,
          value: mockUser.id,
        },
        payload: {
          verificationId: totpVerificationRecord.id,
        },
      }),
      expect.any(Promise)
    );
  });

  it('applies sentinel to backup-code MFA verification even when dev features are disabled', async () => {
    const router = createRouter();

    backupCodeVerificationRoutes(
      router as never,
      {
        libraries: {},
        queries: {},
        sentinel: {},
      } as never
    );

    const handler = getRouteHandler(router, '/experience/verification/backup-code/verify');
    const ctx = {
      experienceInteraction: {
        identifiedUserId: mockUser.id,
        setVerificationRecord: jest.fn(),
        save: jest.fn().mockImplementation(resolveVoid),
      },
      verificationAuditLog: {
        append: jest.fn(),
      },
      guard: {
        body: {
          code: 'backup-code',
        },
      },
    };

    await handler(ctx, jest.fn().mockImplementation(resolveVoid));

    expect(withSentinel).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SentinelActivityAction.MfaBackupCode,
        identifier: {
          type: AdditionalIdentifier.UserId,
          value: mockUser.id,
        },
        payload: {
          verificationId: backupCodeVerificationRecord.id,
        },
      }),
      expect.any(Promise)
    );
  });

  it('applies sentinel to WebAuthn MFA verification even when dev features are disabled', async () => {
    const router = createRouter();

    webAuthnVerificationRoute(
      router as never,
      {
        libraries: {},
        queries: {},
        sentinel: {},
        provider: {},
      } as never
    );

    const handler = getRouteHandler(
      router,
      '/experience/verification/web-authn/authentication/verify'
    );
    const ctx = {
      experienceInteraction: {
        identifiedUserId: mockUser.id,
        getVerificationRecordByTypeAndId: jest.fn(() => webAuthnVerificationRecord),
        save: jest.fn().mockImplementation(resolveVoid),
      },
      verificationAuditLog: {
        append: jest.fn(),
      },
      guard: {
        body: {
          verificationId: webAuthnVerificationRecord.id,
          payload: {
            id: 'credential-id',
            rawId: 'credential-id',
            response: {},
            type: 'public-key',
          },
        },
      },
    };

    await handler(ctx, jest.fn().mockImplementation(resolveVoid));

    expect(ctx.experienceInteraction.getVerificationRecordByTypeAndId).toHaveBeenCalledWith(
      VerificationType.WebAuthn,
      webAuthnVerificationRecord.id
    );
    expect(withSentinel).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SentinelActivityAction.WebAuthn,
        identifier: {
          type: AdditionalIdentifier.UserId,
          value: mockUser.id,
        },
        payload: {
          verificationId: webAuthnVerificationRecord.id,
        },
      }),
      expect.any(Promise)
    );
  });
});
