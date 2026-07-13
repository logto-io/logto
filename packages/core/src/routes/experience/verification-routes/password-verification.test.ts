import {
  InteractionEvent,
  LogtoInlineHookKey,
  SignInIdentifier,
  UsersPasswordEncryptionMethod,
  VerificationType,
} from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import { mockUser } from '#src/__mocks__/user.js';
import RequestError from '#src/errors/RequestError/index.js';

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

const koaGuard = jest.fn(() => passThroughMiddleware);

const withSentinel = jest.fn(
  async (_options: unknown, verificationPromise: Promise<unknown>) => verificationPromise
);

mockEsm('#src/middleware/koa-guard.js', () => ({
  default: koaGuard,
}));

mockEsm('../middleware/koa-experience-verifications-audit-log.js', () => ({
  default: () => passThroughMiddleware,
}));

mockEsm('../classes/libraries/sentinel-guard.js', () => ({
  withSentinel,
}));

const passwordVerificationRecord = {
  id: 'password-verification-id',
  verify: jest.fn(),
  verifyPasswordExpiration: jest.fn().mockImplementation(resolveVoid),
  markAsVerified: jest.fn(),
};

const createPasswordVerification = jest.fn(() => passwordVerificationRecord);

mockEsm('../classes/verifications/password-verification.js', () => ({
  PasswordVerification: {
    create: createPasswordVerification,
  },
}));

const appendPasswordPayloadToInlineHookProvisioningProfile = jest.fn();

mockEsm('../classes/libraries/inline-hook-provisioning-profile.js', () => ({
  appendPasswordPayloadToInlineHookProvisioningProfile,
  toHookProvisioningProfile: (profile: unknown) => profile,
}));

const { default: passwordVerificationRoutes } = await import('./password-verification.js');

const identifier = {
  type: SignInIdentifier.Email,
  value: 'jane@example.com',
};
const password = 'P@ssw0rd';
const invalidCredentialsError = new RequestError({
  code: 'session.invalid_credentials',
  status: 422,
});
const createdUser = {
  ...mockUser,
  id: 'created-user-id',
  primaryEmail: identifier.value,
};
const updatedUser = {
  ...mockUser,
  name: 'Jane Doe',
};
const passwordHashPayload = {
  passwordEncrypted: 'hashed-password',
  passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
};

const createRouter = (): RouterLike => ({
  post: jest.fn<void, [string, ...unknown[]]>(),
});

const getRouteHandler = (router: RouterLike): RouteHandler => {
  const route = router.post.mock.calls.find(
    ([registeredPath]) => registeredPath === '/experience/verification/password'
  );

  if (!route) {
    throw new TypeError('Password verification route is not registered');
  }

  const handler = route.at(-1);

  if (typeof handler !== 'function') {
    throw new TypeError('Password verification route handler is invalid');
  }

  return handler as RouteHandler;
};

const runHook = jest.fn();
const findUserByEmail = jest.fn();
const createUser = jest.fn();
const updateUser = jest.fn();

type PasswordVerificationRouteContext = {
  experienceInteraction: {
    interactionEvent: InteractionEvent;
    provisionLibrary: {
      createUser: typeof createUser;
      updateUser: typeof updateUser;
    };
    setVerificationRecord: jest.Mock;
    save: jest.Mock;
  };
  verificationAuditLog: {
    append: jest.Mock;
  };
  guard: {
    body: {
      identifier: typeof identifier;
      password: string;
    };
  };
  body?: unknown;
  status?: number;
};

const registerRoute = () => {
  const router = createRouter();

  passwordVerificationRoutes(
    router as never,
    {
      libraries: {
        inlineHooks: {
          runHook,
        },
      },
      queries: {
        users: {
          findUserByEmail,
        },
      },
      sentinel: {},
    } as never
  );

  return getRouteHandler(router);
};

const createContext = (
  interactionEvent = InteractionEvent.SignIn
): PasswordVerificationRouteContext => ({
  experienceInteraction: {
    interactionEvent,
    provisionLibrary: {
      createUser,
      updateUser,
    },
    setVerificationRecord: jest.fn(),
    save: jest.fn().mockImplementation(resolveVoid),
  },
  verificationAuditLog: {
    append: jest.fn(),
  },
  guard: {
    body: {
      identifier,
      password,
    },
  },
});

describe('password verification route PostFirstFactorVerification fallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    passwordVerificationRecord.verify.mockResolvedValue(mockUser);
    passwordVerificationRecord.verifyPasswordExpiration.mockImplementation(resolveVoid);
    appendPasswordPayloadToInlineHookProvisioningProfile.mockImplementation(
      async (profile: Record<string, unknown>) => ({
        ...profile,
        ...passwordHashPayload,
      })
    );
    runHook.mockImplementation(resolveVoid);
    findUserByEmail.mockResolvedValue(null);
    createUser.mockResolvedValue(createdUser);
    updateUser.mockResolvedValue(updatedUser);
  });

  it('allows the identity conflict response status', () => {
    registerRoute();

    expect(koaGuard).toHaveBeenCalledWith(
      expect.objectContaining({ status: [200, 400, 401, 409, 422] })
    );
  });

  it('does not run the inline hook when local password verification succeeds', async () => {
    const handler = registerRoute();
    const ctx = createContext();

    await handler(ctx, jest.fn().mockImplementation(resolveVoid));

    expect(runHook).not.toHaveBeenCalled();
    expect(findUserByEmail).not.toHaveBeenCalled();
    expect(passwordVerificationRecord.verifyPasswordExpiration).toHaveBeenCalledWith(mockUser);
    expect(ctx.experienceInteraction.setVerificationRecord).toHaveBeenCalledWith(
      passwordVerificationRecord
    );
    expect(ctx.experienceInteraction.save).toHaveBeenCalled();
    expect(ctx.body).toEqual({ verificationId: passwordVerificationRecord.id });
    expect(ctx.status).toBe(200);
  });

  it('preserves invalid credentials when the hook runtime returns no result', async () => {
    const handler = registerRoute();
    const ctx = createContext();

    passwordVerificationRecord.verify.mockRejectedValueOnce(invalidCredentialsError);

    await expect(handler(ctx, jest.fn().mockImplementation(resolveVoid))).rejects.toBe(
      invalidCredentialsError
    );

    expect(runHook).toHaveBeenCalledWith({
      key: LogtoInlineHookKey.PostFirstFactorVerification,
      event: {
        key: LogtoInlineHookKey.PostFirstFactorVerification,
        interactionEvent: InteractionEvent.SignIn,
        verificationType: VerificationType.Password,
        identifier,
        user: null,
        password,
      },
    });
    expect(createUser).not.toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
    expect(ctx.experienceInteraction.setVerificationRecord).not.toHaveBeenCalled();
  });

  it('does not run the inline hook fallback outside sign-in', async () => {
    const handler = registerRoute();
    const ctx = createContext(InteractionEvent.Register);

    passwordVerificationRecord.verify.mockRejectedValueOnce(invalidCredentialsError);

    await expect(handler(ctx, jest.fn().mockImplementation(resolveVoid))).rejects.toBe(
      invalidCredentialsError
    );

    expect(runHook).not.toHaveBeenCalled();
    expect(findUserByEmail).not.toHaveBeenCalled();
    expect(createUser).not.toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('creates a user from a validated hook result when the local user is missing', async () => {
    const handler = registerRoute();
    const ctx = createContext();

    passwordVerificationRecord.verify.mockRejectedValueOnce(invalidCredentialsError);
    runHook.mockResolvedValueOnce({
      action: 'createUser',
      passwordVerified: true,
      user: {},
    });

    await handler(ctx, jest.fn().mockImplementation(resolveVoid));

    expect(appendPasswordPayloadToInlineHookProvisioningProfile).toHaveBeenCalledWith(
      {
        primaryEmail: identifier.value,
      },
      password
    );
    expect(createUser).toHaveBeenCalledWith(
      {
        primaryEmail: identifier.value,
        ...passwordHashPayload,
      },
      {
        checkIdentifierCollision: true,
        mergeCustomData: true,
      }
    );
    expect(updateUser).not.toHaveBeenCalled();
    expect(passwordVerificationRecord.markAsVerified).toHaveBeenCalled();
    expect(passwordVerificationRecord.verifyPasswordExpiration).toHaveBeenCalledWith(createdUser);
    expect(ctx.experienceInteraction.setVerificationRecord).toHaveBeenCalledWith(
      passwordVerificationRecord
    );
  });

  it('does not provision before sentinel accepts the hook fallback', async () => {
    const handler = registerRoute();
    const ctx = createContext();
    const sentinelError = new RequestError({
      code: 'session.verification_blocked_too_many_attempts',
    });

    passwordVerificationRecord.verify.mockRejectedValueOnce(invalidCredentialsError);
    runHook.mockResolvedValueOnce({
      action: 'createUser',
      passwordVerified: true,
      user: {},
    });
    withSentinel.mockImplementationOnce(async (_options, verificationPromise) => {
      await verificationPromise;
      throw sentinelError;
    });

    await expect(handler(ctx, jest.fn().mockImplementation(resolveVoid))).rejects.toBe(
      sentinelError
    );

    expect(createUser).not.toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
    expect(passwordVerificationRecord.markAsVerified).not.toHaveBeenCalled();
  });

  it('updates the existing user from a validated hook result when local password is wrong', async () => {
    const handler = registerRoute();
    const ctx = createContext();

    passwordVerificationRecord.verify.mockRejectedValueOnce(invalidCredentialsError);
    findUserByEmail.mockResolvedValueOnce(mockUser);
    runHook.mockResolvedValueOnce({
      action: 'updateUser',
      passwordVerified: true,
      user: {
        name: 'Jane Doe',
      },
    });

    await handler(ctx, jest.fn().mockImplementation(resolveVoid));

    expect(runHook).toHaveBeenCalledWith({
      key: LogtoInlineHookKey.PostFirstFactorVerification,
      event: {
        key: LogtoInlineHookKey.PostFirstFactorVerification,
        interactionEvent: InteractionEvent.SignIn,
        verificationType: VerificationType.Password,
        identifier,
        user: {
          id: mockUser.id,
          username: mockUser.username,
          primaryEmail: mockUser.primaryEmail,
          primaryPhone: mockUser.primaryPhone,
          name: mockUser.name,
          avatar: mockUser.avatar,
          customData: mockUser.customData,
          profile: mockUser.profile,
        },
        password,
      },
    });
    expect(appendPasswordPayloadToInlineHookProvisioningProfile).toHaveBeenCalledWith(
      {
        name: 'Jane Doe',
      },
      password
    );
    expect(createUser).not.toHaveBeenCalled();
    expect(updateUser).toHaveBeenCalledWith(
      mockUser.id,
      {
        name: 'Jane Doe',
        ...passwordHashPayload,
      },
      { mergeCustomData: true }
    );
    expect(passwordVerificationRecord.markAsVerified).toHaveBeenCalled();
  });

  it('surfaces identity conflict when the hook create action targets an existing user', async () => {
    const handler = registerRoute();
    const ctx = createContext();

    passwordVerificationRecord.verify.mockRejectedValueOnce(invalidCredentialsError);
    findUserByEmail.mockResolvedValueOnce(mockUser);
    runHook.mockResolvedValueOnce({
      action: 'createUser',
      passwordVerified: true,
      user: {
        primaryEmail: identifier.value,
      },
    });

    await expect(handler(ctx, jest.fn().mockImplementation(resolveVoid))).rejects.toMatchError(
      new RequestError({ code: 'session.identity_conflict', status: 409 })
    );

    expect(appendPasswordPayloadToInlineHookProvisioningProfile).not.toHaveBeenCalled();
    expect(createUser).not.toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('does not run the inline hook fallback for suspended users', async () => {
    const handler = registerRoute();
    const ctx = createContext();

    passwordVerificationRecord.verify.mockRejectedValueOnce(invalidCredentialsError);
    findUserByEmail.mockResolvedValueOnce({
      ...mockUser,
      isSuspended: true,
    });

    await expect(handler(ctx, jest.fn().mockImplementation(resolveVoid))).rejects.toBe(
      invalidCredentialsError
    );

    expect(runHook).not.toHaveBeenCalled();
    expect(createUser).not.toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
  });
});
