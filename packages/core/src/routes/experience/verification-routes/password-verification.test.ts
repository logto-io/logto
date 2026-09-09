/* eslint-disable max-lines -- Password verification fallback scenarios share extensive route mocks. */
import {
  AdditionalIdentifier,
  InteractionEvent,
  LogtoActionKey,
  SentinelActivityAction,
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
const createPasswordVerificationForUser = jest.fn(() => passwordVerificationRecord);

mockEsm('../classes/verifications/password-verification.js', () => ({
  PasswordVerification: {
    create: createPasswordVerification,
    createForUser: createPasswordVerificationForUser,
  },
}));

const appendPasswordPayloadToActionProvisioningProfile = jest.fn();

mockEsm('../classes/libraries/action-provisioning-profile.js', () => ({
  appendPasswordPayloadToActionProvisioningProfile,
  toActionProvisioningProfile: (profile: unknown) => profile,
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

const getSentinelPromise = async () => {
  const sentinelPromise = withSentinel.mock.calls[0]?.[1];

  if (!sentinelPromise) {
    throw new TypeError('Sentinel promise was not captured');
  }

  return sentinelPromise;
};

const runAction = jest.fn();
const findUserByEmail = jest.fn();
const findUserById = jest.fn();
const getSignInExperienceData = jest.fn();
const createUser = jest.fn();
const updateUser = jest.fn();
const createLog = jest.fn();
const applicationId = 'application-id';
const sessionId = 'session-id';

type PasswordVerificationRouteContext = {
  experienceInteraction: {
    interactionEvent: InteractionEvent;
    subjectUserId?: string;
    provisionLibrary: {
      createUser: typeof createUser;
      updateUser: typeof updateUser;
    };
    signInExperienceValidator: {
      getSignInExperienceData: typeof getSignInExperienceData;
    };
    setVerificationRecord: jest.Mock;
    save: jest.Mock;
  };
  verificationAuditLog: {
    append: jest.Mock;
  };
  createLog: typeof createLog;
  interactionDetails: {
    jti: string;
    params: {
      client_id: string;
    };
  };
  guard: {
    body: {
      identifier?: typeof identifier;
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
        actions: {
          runAction,
        },
      },
      queries: {
        users: {
          findUserByEmail,
          findUserById,
        },
      },
      sentinel: {},
    } as never
  );

  return getRouteHandler(router);
};

const createContext = (
  interactionEvent = InteractionEvent.SignIn,
  {
    subjectUserId,
    body = { identifier, password },
  }: {
    subjectUserId?: string;
    body?: PasswordVerificationRouteContext['guard']['body'];
  } = {}
): PasswordVerificationRouteContext => ({
  experienceInteraction: {
    interactionEvent,
    subjectUserId,
    provisionLibrary: {
      createUser,
      updateUser,
    },
    signInExperienceValidator: {
      getSignInExperienceData,
    },
    setVerificationRecord: jest.fn(),
    save: jest.fn().mockImplementation(resolveVoid),
  },
  verificationAuditLog: {
    append: jest.fn(),
  },
  createLog,
  interactionDetails: {
    jti: sessionId,
    params: {
      client_id: applicationId,
    },
  },
  guard: {
    body,
  },
});

describe('password verification route PostFirstFactorVerification fallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    passwordVerificationRecord.verify.mockResolvedValue(mockUser);
    passwordVerificationRecord.verifyPasswordExpiration.mockImplementation(resolveVoid);
    appendPasswordPayloadToActionProvisioningProfile.mockImplementation(
      async (profile: Record<string, unknown>) => ({
        ...profile,
        ...passwordHashPayload,
      })
    );
    runAction.mockImplementation(resolveVoid);
    findUserByEmail.mockResolvedValue(null);
    createUser.mockResolvedValue(createdUser);
    updateUser.mockResolvedValue(updatedUser);
  });

  it('allows the identity conflict and missing subject response statuses', () => {
    registerRoute();

    expect(koaGuard).toHaveBeenCalledWith(
      expect.objectContaining({ status: [200, 400, 401, 404, 409, 422] })
    );
  });

  it('does not run the action when local password verification succeeds', async () => {
    const handler = registerRoute();
    const ctx = createContext();

    await handler(ctx, jest.fn().mockImplementation(resolveVoid));

    expect(runAction).not.toHaveBeenCalled();
    expect(findUserByEmail).not.toHaveBeenCalled();
    expect(passwordVerificationRecord.verifyPasswordExpiration).toHaveBeenCalledWith(mockUser);
    expect(ctx.experienceInteraction.setVerificationRecord).toHaveBeenCalledWith(
      passwordVerificationRecord
    );
    expect(ctx.experienceInteraction.save).toHaveBeenCalled();
    expect(ctx.body).toEqual({ verificationId: passwordVerificationRecord.id });
    expect(ctx.status).toBe(200);
  });

  it('wraps local failure and action-declined invalid credentials in one Sentinel promise', async () => {
    const handler = registerRoute();
    const ctx = createContext();

    passwordVerificationRecord.verify.mockRejectedValueOnce(invalidCredentialsError);

    await expect(handler(ctx, jest.fn().mockImplementation(resolveVoid))).rejects.toBe(
      invalidCredentialsError
    );

    expect(withSentinel).toHaveBeenCalledTimes(1);
    await expect(getSentinelPromise()).rejects.toBe(invalidCredentialsError);
    expect(runAction).toHaveBeenCalledWith({
      key: LogtoActionKey.PostFirstFactorVerification,
      auditContext: {
        createLog,
        sessionId,
        applicationId,
        userId: undefined,
      },
      event: {
        key: LogtoActionKey.PostFirstFactorVerification,
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

  it('does not run the action fallback outside sign-in', async () => {
    const handler = registerRoute();
    const ctx = createContext(InteractionEvent.Register);

    passwordVerificationRecord.verify.mockRejectedValueOnce(invalidCredentialsError);

    await expect(handler(ctx, jest.fn().mockImplementation(resolveVoid))).rejects.toBe(
      invalidCredentialsError
    );

    expect(runAction).not.toHaveBeenCalled();
    expect(findUserByEmail).not.toHaveBeenCalled();
    expect(createUser).not.toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('wraps local failure and action-created user success in one Sentinel promise', async () => {
    const handler = registerRoute();
    const ctx = createContext();

    passwordVerificationRecord.verify.mockRejectedValueOnce(invalidCredentialsError);
    runAction.mockResolvedValueOnce({
      action: 'createUser',
      passwordVerified: true,
      user: {},
    });

    await handler(ctx, jest.fn().mockImplementation(resolveVoid));

    expect(withSentinel).toHaveBeenCalledTimes(1);
    await expect(getSentinelPromise()).resolves.toEqual(
      expect.objectContaining({ actionResult: { action: 'createUser', user: {} } })
    );
    expect(appendPasswordPayloadToActionProvisioningProfile).toHaveBeenCalledWith(
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

  it('does not provision before sentinel accepts the action fallback', async () => {
    const handler = registerRoute();
    const ctx = createContext();
    const sentinelError = new RequestError({
      code: 'session.verification_blocked_too_many_attempts',
    });

    passwordVerificationRecord.verify.mockRejectedValueOnce(invalidCredentialsError);
    runAction.mockResolvedValueOnce({
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

  it('updates the existing user from a validated action result when local password is wrong', async () => {
    const handler = registerRoute();
    const ctx = createContext();

    passwordVerificationRecord.verify.mockRejectedValueOnce(invalidCredentialsError);
    findUserByEmail.mockResolvedValueOnce(mockUser);
    runAction.mockResolvedValueOnce({
      action: 'updateUser',
      passwordVerified: true,
      user: {
        name: 'Jane Doe',
      },
    });

    await handler(ctx, jest.fn().mockImplementation(resolveVoid));

    expect(runAction).toHaveBeenCalledWith({
      key: LogtoActionKey.PostFirstFactorVerification,
      auditContext: {
        createLog,
        sessionId,
        applicationId,
        userId: mockUser.id,
      },
      event: {
        key: LogtoActionKey.PostFirstFactorVerification,
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
    expect(appendPasswordPayloadToActionProvisioningProfile).toHaveBeenCalledWith(
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

  it('surfaces identity conflict when the action create result targets an existing user', async () => {
    const handler = registerRoute();
    const ctx = createContext();

    passwordVerificationRecord.verify.mockRejectedValueOnce(invalidCredentialsError);
    findUserByEmail.mockResolvedValueOnce(mockUser);
    runAction.mockResolvedValueOnce({
      action: 'createUser',
      passwordVerified: true,
      user: {
        primaryEmail: identifier.value,
      },
    });

    await expect(handler(ctx, jest.fn().mockImplementation(resolveVoid))).rejects.toMatchError(
      new RequestError({ code: 'session.identity_conflict', status: 409 })
    );

    expect(appendPasswordPayloadToActionProvisioningProfile).not.toHaveBeenCalled();
    expect(createUser).not.toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('does not run the action fallback for suspended users', async () => {
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

    expect(runAction).not.toHaveBeenCalled();
    expect(createUser).not.toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
  });
});
describe('password verification route pinned-user variant', () => {
  const subject = { ...mockUser, id: 'subject-user-id' };
  const passwordSignInMethod = (identifier: SignInIdentifier) => ({
    identifier,
    password: true,
    verificationCode: false,
    isPasswordPrimary: true,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    passwordVerificationRecord.verify.mockResolvedValue(subject);
    passwordVerificationRecord.verifyPasswordExpiration.mockImplementation(resolveVoid);
    findUserById.mockResolvedValue(subject);
    getSignInExperienceData.mockResolvedValue({
      signIn: { methods: [passwordSignInMethod(SignInIdentifier.Email)] },
    });
  });

  it('verifies against the subject the interaction carries when no identifier is given', async () => {
    const handler = registerRoute();
    const ctx = createContext(InteractionEvent.SignIn, {
      subjectUserId: subject.id,
      body: { password },
    });

    await handler(ctx, jest.fn().mockImplementation(resolveVoid));

    expect(findUserById).toHaveBeenCalledWith(subject.id);
    expect(createPasswordVerificationForUser).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      subject.id
    );
    expect(createPasswordVerification).not.toHaveBeenCalled();
    expect(passwordVerificationRecord.verify).toHaveBeenCalledWith(password);
    expect(passwordVerificationRecord.verifyPasswordExpiration).toHaveBeenCalledWith(subject);
    expect(ctx.experienceInteraction.setVerificationRecord).toHaveBeenCalledWith(
      passwordVerificationRecord
    );
    expect(ctx.experienceInteraction.save).toHaveBeenCalled();
    expect(ctx.body).toEqual({ verificationId: passwordVerificationRecord.id });
    expect(ctx.status).toBe(200);
  });

  it('rejects the identifier-less payload before the interaction carries a subject', async () => {
    const handler = registerRoute();
    const ctx = createContext(InteractionEvent.SignIn, { body: { password } });

    await expect(handler(ctx, jest.fn().mockImplementation(resolveVoid))).rejects.toMatchError(
      new RequestError({ code: 'session.identifier_not_found', status: 404 })
    );

    expect(withSentinel).not.toHaveBeenCalled();
    expect(createPasswordVerificationForUser).not.toHaveBeenCalled();
    expect(ctx.experienceInteraction.setVerificationRecord).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: 'the first identifier the sign-in experience accepts with a password',
      methods: [
        passwordSignInMethod(SignInIdentifier.Phone),
        passwordSignInMethod(SignInIdentifier.Email),
      ],
      user: subject,
      expected: { type: SignInIdentifier.Phone, value: subject.primaryPhone },
    },
    {
      name: 'the next identifier the subject has when the first is unset',
      methods: [
        passwordSignInMethod(SignInIdentifier.Phone),
        passwordSignInMethod(SignInIdentifier.Email),
      ],
      user: { ...subject, primaryPhone: null },
      expected: { type: SignInIdentifier.Email, value: subject.primaryEmail },
    },
    {
      name: 'an identifier of the subject in sign-in identifier order when none is a password sign-in method',
      methods: [{ ...passwordSignInMethod(SignInIdentifier.Email), password: false }],
      user: subject,
      expected: { type: SignInIdentifier.Username, value: subject.username },
    },
    {
      name: 'the user id when the subject has no identifier',
      methods: [passwordSignInMethod(SignInIdentifier.Email)],
      user: { ...subject, username: null, primaryEmail: null, primaryPhone: null },
      expected: { type: AdditionalIdentifier.UserId, value: subject.id },
    },
  ])('keys the sentinel lockout on $name', async ({ methods, user, expected }) => {
    const handler = registerRoute();
    const ctx = createContext(InteractionEvent.SignIn, {
      subjectUserId: subject.id,
      body: { password },
    });

    findUserById.mockResolvedValueOnce(user);
    getSignInExperienceData.mockResolvedValueOnce({ signIn: { methods } });

    await handler(ctx, jest.fn().mockImplementation(resolveVoid));

    expect(withSentinel).toHaveBeenCalledWith(
      expect.objectContaining({
        action: SentinelActivityAction.Password,
        identifier: expected,
        payload: {
          event: InteractionEvent.SignIn,
          verificationId: passwordVerificationRecord.id,
        },
      }),
      expect.any(Promise)
    );
  });

  it('does not run the action fallback for a wrong password of the subject', async () => {
    const handler = registerRoute();
    const ctx = createContext(InteractionEvent.SignIn, {
      subjectUserId: subject.id,
      body: { password },
    });

    passwordVerificationRecord.verify.mockRejectedValueOnce(invalidCredentialsError);

    await expect(handler(ctx, jest.fn().mockImplementation(resolveVoid))).rejects.toBe(
      invalidCredentialsError
    );

    // The failed attempt is still reported to the sentinel.
    expect(withSentinel).toHaveBeenCalledTimes(1);
    await expect(getSentinelPromise()).rejects.toBe(invalidCredentialsError);
    expect(runAction).not.toHaveBeenCalled();
    expect(createUser).not.toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
    expect(ctx.experienceInteraction.setVerificationRecord).not.toHaveBeenCalled();
  });

  it('keeps the identifier path when an identifier is given alongside a subject', async () => {
    const handler = registerRoute();
    const ctx = createContext(InteractionEvent.SignIn, { subjectUserId: subject.id });

    passwordVerificationRecord.verify.mockResolvedValueOnce(mockUser);

    await handler(ctx, jest.fn().mockImplementation(resolveVoid));

    expect(createPasswordVerification).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      identifier
    );
    expect(createPasswordVerificationForUser).not.toHaveBeenCalled();
    expect(findUserById).not.toHaveBeenCalled();
    expect(withSentinel).toHaveBeenCalledWith(
      expect.objectContaining({ identifier }),
      expect.any(Promise)
    );
  });
});
/* eslint-enable max-lines */
