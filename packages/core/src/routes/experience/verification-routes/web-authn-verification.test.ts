import { createMockUtils } from '@logto/shared/esm';

import RequestError from '#src/errors/RequestError/index.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

type Next = () => Promise<unknown>;
type RouteHandler = (ctx: Record<string, unknown>, next: Next) => Promise<unknown>;
type RouterLike = { post: jest.Mock<void, [string, ...unknown[]]> };

const passThroughMiddleware = async (_ctx: unknown, next: Next) => next();
async function resolveVoid(): Promise<void> {
  await Promise.resolve();
}

const koaGuard = jest.fn(() => passThroughMiddleware);
mockEsm('#src/middleware/koa-guard.js', () => ({ default: koaGuard }));
mockEsm('../middleware/koa-experience-verifications-audit-log.js', () => ({
  default: () => passThroughMiddleware,
}));
mockEsm('../classes/libraries/sentinel-guard.js', () => ({
  withSentinel: jest.fn(
    async (_options: unknown, verificationPromise: Promise<unknown>) => verificationPromise
  ),
}));

const verificationRecord = {
  id: 'webauthn-verification-id',
  userId: 'pinned-subject-id',
  verifyWebAuthnAuthentication: jest.fn(),
};

mockEsm('../classes/verifications/web-authn-verification.js', () => ({
  SignInPasskeyVerification: jest.fn().mockImplementation(() => verificationRecord),
  WebAuthnVerification: jest.fn(),
}));

const { default: webAuthnVerificationRoute } = await import('./web-authn-verification.js');

const passkeyVerifyPath = '/experience/verification/sign-in-passkey/authentication/verify';
const mfaVerifyPath = '/experience/verification/web-authn/authentication/verify';

const createRouter = (): RouterLike => ({
  post: jest.fn<void, [string, ...unknown[]]>(),
});

const getRouteHandler = (router: RouterLike, path: string): RouteHandler => {
  const route = router.post.mock.calls.find(([registeredPath]) => registeredPath === path);
  if (!route || typeof route.at(-1) !== 'function') {
    throw new TypeError(`Route handler not found for ${path}`);
  }
  return route.at(-1) as RouteHandler;
};

const registerRoute = (path: string = passkeyVerifyPath) => {
  const router = createRouter();
  webAuthnVerificationRoute(
    router as never,
    {
      libraries: {},
      queries: {},
      sentinel: {},
      provider: {
        interactionDetails: jest.fn().mockResolvedValue({
          result: {
            signInPasskey: {
              authenticationOptions: { challenge: 'challenge', rpId: 'example.com' },
            },
          },
        }),
      },
    } as never
  );
  return getRouteHandler(router, path);
};

const mockPayload = {
  id: 'credential-id',
  rawId: 'credential-id',
  response: { clientDataJSON: 'client-data' },
  type: 'public-key',
};

const identityConflictError = new RequestError({
  code: 'session.identity_conflict',
  status: 409,
});

const createContext = ({
  isStepUp,
  verificationId,
  recordUserId = 'pinned-subject-id',
}: {
  isStepUp: boolean;
  verificationId?: string;
  recordUserId?: string;
}) => ({
  req: {},
  res: {},
  experienceInteraction: {
    isStepUp,
    subjectUserId: 'pinned-subject-id',
    getVerificationRecordByTypeAndId: jest.fn(() => ({
      ...verificationRecord,
      userId: recordUserId,
    })),
    setVerificationRecord: jest.fn(),
    consumeForMfa: jest.fn(),
    skipCaptcha: jest.fn(),
    save: jest.fn().mockImplementation(resolveVoid),
  },
  verificationAuditLog: { append: jest.fn() },
  guard: {
    body: {
      ...(verificationId ? { verificationId } : {}),
      payload: mockPayload,
    },
  },
});

describe('webAuthn verification routes verify', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    verificationRecord.verifyWebAuthnAuthentication.mockReset();
    verificationRecord.verifyWebAuthnAuthentication.mockRejectedValue(identityConflictError);
  });

  it('allows step-up 403 and identity conflict response statuses in koaGuard', () => {
    registerRoute();
    expect(koaGuard).toHaveBeenCalledWith(
      expect.objectContaining({ status: [200, 400, 403, 404, 409] })
    );
    expect(koaGuard).toHaveBeenCalledWith(
      expect.objectContaining({ status: [200, 400, 403, 404] })
    );
  });

  it.each([
    { isStepUp: true, verificationId: 'existing-id', expectedStatus: 403 },
    { isStepUp: true, verificationId: undefined, expectedStatus: 403 },
    { isStepUp: false, verificationId: 'existing-id', expectedStatus: 409 },
    { isStepUp: false, verificationId: undefined, expectedStatus: 409 },
  ])(
    'passkey verify returns $expectedStatus for identity conflict (isStepUp: $isStepUp, verificationId: $verificationId)',
    async ({ isStepUp, verificationId, expectedStatus }) => {
      const handler = registerRoute(passkeyVerifyPath);
      const ctx = createContext({ isStepUp, verificationId });

      await expect(handler(ctx, jest.fn().mockImplementation(resolveVoid))).rejects.toMatchError(
        new RequestError({ code: 'session.identity_conflict', status: expectedStatus })
      );
    }
  );

  it.each([
    { isStepUp: true, expectedStatus: 403 },
    { isStepUp: false, expectedStatus: 404 },
  ])(
    'MFA verify returns $expectedStatus for identity conflict (isStepUp: $isStepUp)',
    async ({ isStepUp, expectedStatus }) => {
      const handler = registerRoute(mfaVerifyPath);
      const ctx = createContext({
        isStepUp,
        verificationId: 'mfa-verification-id',
        recordUserId: 'different-user-id',
      });

      await expect(handler(ctx, jest.fn().mockImplementation(resolveVoid))).rejects.toMatchError(
        new RequestError({ code: 'session.identity_conflict', status: expectedStatus })
      );
    }
  );
});
