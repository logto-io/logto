import {
  defaultMessageRateLimitPolicy,
  InteractionEvent,
  MfaFactor,
  SentinelActivityAction,
  SignInIdentifier,
} from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

import type { EmailCodeVerification } from '../classes/verifications/code-verification.js';
import type { ExperienceInteractionRouterContext } from '../types.js';

type MockExperienceInteraction = {
  interactionEvent: InteractionEvent;
  identifiedUserId?: string;
  setVerificationRecord: jest.MockedFunction<() => Promise<void>>;
  save: jest.MockedFunction<() => Promise<void>>;
  signInExperienceValidator: {
    guardEmailBlocklist: jest.MockedFunction<() => Promise<void>>;
    isRegistrationDisabled: jest.MockedFunction<() => Promise<boolean>>;
  };
};

const { jest } = import.meta;

async function resolveVoid(): Promise<void> {
  await Promise.resolve();
}

const { sendCode, getMfaIdentifier } = await import('./verification-code-helpers.js');

// Provide a permissive activity store so the message rate guard allows sends by default.
const mockSentinelActivities = {
  countActivities: jest.fn().mockResolvedValue(0),
  insertActivity: jest.fn().mockImplementation(resolveVoid),
};

// `buildMessageRateGuard` reads the per-tenant override; default to none so the system policy applies.
const mockLogtoConfigs = {
  getMessageRateLimitOverride: jest.fn().mockResolvedValue(null),
};

describe('sendCode parameter passing', () => {
  // To make a void callable function/method
  const mockSendVerificationCode = jest.fn().mockImplementation(resolveVoid);

  const mockCodeVerification = {
    id: 'helper-test-verification-id',
    sendVerificationCode: mockSendVerificationCode,
  } as unknown as EmailCodeVerification;

  const mockExperienceInteraction: MockExperienceInteraction = {
    interactionEvent: InteractionEvent.SignIn,
    setVerificationRecord: jest.fn().mockImplementation(resolveVoid),
    save: jest.fn().mockImplementation(resolveVoid),
    signInExperienceValidator: {
      guardEmailBlocklist: jest.fn().mockImplementation(resolveVoid),
      // Default: registration is enabled, so delivery is never suppressed for sign-in.
      isRegistrationDisabled: jest.fn().mockResolvedValue(false),
    },
  };

  const mockBuildVerificationCodeContext = jest.fn().mockImplementation(resolveVoid);
  const mockPasscodeLibrary = {
    buildVerificationCodeContext: mockBuildVerificationCodeContext,
  };

  const mockQueries = {
    sentinelActivities: mockSentinelActivities,
    logtoConfigs: mockLogtoConfigs,
    users: {
      hasUserWithEmail: jest.fn().mockResolvedValue(true),
      hasUserWithNormalizedPhone: jest.fn().mockResolvedValue(true),
    },
  } as unknown as Queries;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSendVerificationCode.mockImplementation(resolveVoid);
    mockExperienceInteraction.save.mockImplementation(resolveVoid);
    mockBuildVerificationCodeContext.mockResolvedValue({});
    // Restore the default: registration is enabled, so sign-in delivery is not suppressed.
    mockExperienceInteraction.signInExperienceValidator.isRegistrationDisabled.mockResolvedValue(
      false
    );
  });

  it('should pass ctx.request.ip to sendVerificationCode', async () => {
    const SAMPLE_IP = '192.168.1.225';

    const ctx = {
      request: { ip: SAMPLE_IP },
      createLog: jest.fn(() => ({ append: jest.fn().mockImplementation(resolveVoid) })),
      experienceInteraction: mockExperienceInteraction,
      emailI18n: { locale: 'jp' },
    };

    // Only verify the ip parameter so use never to ignore others at here to bypass type check
    const libraries = { passcodes: mockPasscodeLibrary } as unknown as Partial<Libraries>;
    await sendCode({
      identifier: { type: SignInIdentifier.Phone, value: '+8613123456789' },
      createVerificationRecord: () => mockCodeVerification,
      libraries: libraries as unknown as Libraries,
      queries: mockQueries,
      ctx: ctx as unknown as ExperienceInteractionRouterContext,
    });

    expect(mockSendVerificationCode).toHaveBeenCalledWith(
      expect.objectContaining({
        ip: SAMPLE_IP,
      }),
      expect.objectContaining({
        skipDelivery: false,
      })
    );
  });

  it('should skip delivery for forgot-password with non-existing email user', async () => {
    const mockQueriesNoUser = {
      sentinelActivities: mockSentinelActivities,
      logtoConfigs: mockLogtoConfigs,
      users: {
        hasUserWithEmail: jest.fn().mockResolvedValue(false),
        hasUserWithNormalizedPhone: jest.fn().mockResolvedValue(false),
      },
    } as unknown as Queries;

    const ctx = {
      request: { ip: '127.0.0.1' },
      createLog: jest.fn(() => ({ append: jest.fn().mockImplementation(resolveVoid) })),
      experienceInteraction: {
        ...mockExperienceInteraction,
        interactionEvent: InteractionEvent.ForgotPassword,
      },
      emailI18n: {},
    };

    const libraries = { passcodes: mockPasscodeLibrary } as unknown as Partial<Libraries>;
    await sendCode({
      identifier: { type: SignInIdentifier.Email, value: 'nonexistent@example.com' },
      interactionEvent: InteractionEvent.ForgotPassword,
      createVerificationRecord: () => mockCodeVerification,
      libraries: libraries as unknown as Libraries,
      queries: mockQueriesNoUser,
      ctx: ctx as unknown as ExperienceInteractionRouterContext,
    });

    expect(mockQueriesNoUser.users.hasUserWithEmail).toHaveBeenCalledWith(
      'nonexistent@example.com'
    );
    expect(mockBuildVerificationCodeContext).not.toHaveBeenCalled();
    expect(mockSendVerificationCode).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ skipDelivery: true })
    );
    // The suppressed send still passes through the rate guard so it counts toward the cap.
    expect(mockSentinelActivities.countActivities).toHaveBeenCalled();
  });

  it('should not skip delivery for forgot-password with existing user', async () => {
    const mockQueriesWithUser = {
      sentinelActivities: mockSentinelActivities,
      logtoConfigs: mockLogtoConfigs,
      users: {
        hasUserWithEmail: jest.fn().mockResolvedValue(true),
        hasUserWithNormalizedPhone: jest.fn().mockResolvedValue(true),
      },
    } as unknown as Queries;

    const ctx = {
      request: { ip: '127.0.0.1' },
      createLog: jest.fn(() => ({ append: jest.fn().mockImplementation(resolveVoid) })),
      experienceInteraction: {
        ...mockExperienceInteraction,
        interactionEvent: InteractionEvent.ForgotPassword,
      },
      emailI18n: {},
    };

    const libraries = { passcodes: mockPasscodeLibrary } as unknown as Partial<Libraries>;
    await sendCode({
      identifier: { type: SignInIdentifier.Phone, value: '+8613123456789' },
      interactionEvent: InteractionEvent.ForgotPassword,
      createVerificationRecord: () => mockCodeVerification,
      libraries: libraries as unknown as Libraries,
      queries: mockQueriesWithUser,
      ctx: ctx as unknown as ExperienceInteractionRouterContext,
    });

    expect(mockQueriesWithUser.users.hasUserWithNormalizedPhone).toHaveBeenCalledWith(
      '+8613123456789'
    );
    expect(mockSendVerificationCode).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ skipDelivery: false })
    );
  });

  it('should not check user existence for non-ForgotPassword events', async () => {
    const mockQueriesTracking = {
      sentinelActivities: mockSentinelActivities,
      logtoConfigs: mockLogtoConfigs,
      users: {
        hasUserWithEmail: jest.fn().mockResolvedValue(false),
        hasUserWithNormalizedPhone: jest.fn().mockResolvedValue(false),
      },
    } as unknown as Queries;

    const ctx = {
      request: { ip: '127.0.0.1' },
      createLog: jest.fn(() => ({ append: jest.fn().mockImplementation(resolveVoid) })),
      experienceInteraction: mockExperienceInteraction,
      emailI18n: {},
    };

    const libraries = { passcodes: mockPasscodeLibrary } as unknown as Partial<Libraries>;
    await sendCode({
      identifier: { type: SignInIdentifier.Email, value: 'test@example.com' },
      interactionEvent: InteractionEvent.SignIn,
      createVerificationRecord: () => mockCodeVerification,
      libraries: libraries as unknown as Libraries,
      queries: mockQueriesTracking,
      ctx: ctx as unknown as ExperienceInteractionRouterContext,
    });

    expect(mockQueriesTracking.users.hasUserWithEmail).not.toHaveBeenCalled();
    expect(mockSendVerificationCode).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ skipDelivery: false })
    );
  });

  it('rejects with 429 and does not send when the recipient is over the rate-limit cap', async () => {
    // Simulate the per-recipient cap being reached for the default policy.
    mockSentinelActivities.countActivities.mockResolvedValueOnce(
      defaultMessageRateLimitPolicy.maxSendsPerRecipient
    );

    const ctx = {
      request: { ip: '127.0.0.1' },
      createLog: jest.fn(() => ({ append: jest.fn().mockImplementation(resolveVoid) })),
      appendExceptionHookContext: jest.fn(),
      experienceInteraction: mockExperienceInteraction,
      emailI18n: {},
    };
    const libraries = { passcodes: mockPasscodeLibrary } as unknown as Partial<Libraries>;

    await expect(
      sendCode({
        identifier: { type: SignInIdentifier.Email, value: 'spammed@example.com' },
        interactionEvent: InteractionEvent.SignIn,
        createVerificationRecord: () => mockCodeVerification,
        libraries: libraries as unknown as Libraries,
        queries: mockQueries,
        ctx: ctx as unknown as ExperienceInteractionRouterContext,
      })
    ).rejects.toMatchObject({ code: 'request.message_rate_limited', status: 429 });

    expect(mockSendVerificationCode).not.toHaveBeenCalled();
    // The throttle emits the `Message.RateLimited` exception hook for webhook delivery.
    expect(ctx.appendExceptionHookContext).toHaveBeenCalledWith('Message.RateLimited', {
      action: SentinelActivityAction.VerificationCodeSend,
      recipient: 'spammed@example.com',
    });
  });

  const buildUnknownUserQueries = () =>
    ({
      sentinelActivities: mockSentinelActivities,
      logtoConfigs: mockLogtoConfigs,
      users: {
        hasUserWithEmail: jest.fn().mockResolvedValue(false),
        hasUserWithNormalizedPhone: jest.fn().mockResolvedValue(false),
      },
    }) as unknown as Queries;

  it('rejects with 429 for a suppressed send over the cap, so suppression cannot be enumerated', async () => {
    // Forgot-password to an unknown user suppresses delivery, but the send must still be rate-limited:
    // hitting the cap here proves an unregistered recipient is throttled exactly like a registered one.
    mockSentinelActivities.countActivities.mockResolvedValueOnce(
      defaultMessageRateLimitPolicy.maxSendsPerRecipient
    );

    const ctx = {
      request: { ip: '127.0.0.1' },
      createLog: jest.fn(() => ({ append: jest.fn().mockImplementation(resolveVoid) })),
      appendExceptionHookContext: jest.fn(),
      experienceInteraction: {
        ...mockExperienceInteraction,
        interactionEvent: InteractionEvent.ForgotPassword,
      },
      emailI18n: {},
    };
    const libraries = { passcodes: mockPasscodeLibrary } as unknown as Partial<Libraries>;

    await expect(
      sendCode({
        identifier: { type: SignInIdentifier.Email, value: 'unknown@example.com' },
        interactionEvent: InteractionEvent.ForgotPassword,
        createVerificationRecord: () => mockCodeVerification,
        libraries: libraries as unknown as Libraries,
        queries: buildUnknownUserQueries(),
        ctx: ctx as unknown as ExperienceInteractionRouterContext,
      })
    ).rejects.toMatchObject({ code: 'request.message_rate_limited', status: 429 });

    // The guard rejects before the (suppressed) send runs, and the throttle still emits the hook.
    expect(mockSendVerificationCode).not.toHaveBeenCalled();
    expect(ctx.appendExceptionHookContext).toHaveBeenCalledWith('Message.RateLimited', {
      action: SentinelActivityAction.VerificationCodeSend,
      recipient: 'unknown@example.com',
    });
  });

  const buildSignInCtx = (
    experienceInteraction: MockExperienceInteraction = mockExperienceInteraction
  ) => ({
    request: { ip: '127.0.0.1' },
    createLog: jest.fn(() => ({ append: jest.fn().mockImplementation(resolveVoid) })),
    appendExceptionHookContext: jest.fn(),
    experienceInteraction,
    emailI18n: {},
  });

  it('skips delivery for sign-in to an unknown recipient when registration is disabled', async () => {
    mockExperienceInteraction.signInExperienceValidator.isRegistrationDisabled.mockResolvedValueOnce(
      true
    );
    const ctx = buildSignInCtx();
    const libraries = { passcodes: mockPasscodeLibrary } as unknown as Partial<Libraries>;

    await sendCode({
      identifier: { type: SignInIdentifier.Email, value: 'stranger@example.com' },
      interactionEvent: InteractionEvent.SignIn,
      createVerificationRecord: () => mockCodeVerification,
      libraries: libraries as unknown as Libraries,
      queries: buildUnknownUserQueries(),
      ctx: ctx as unknown as ExperienceInteractionRouterContext,
    });

    // The passcode record is still created and nothing is delivered, but the rate guard still runs:
    // a suppressed send must consume the recipient's quota so registration status cannot be probed.
    expect(mockSendVerificationCode).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ skipDelivery: true })
    );
    expect(mockSentinelActivities.countActivities).toHaveBeenCalled();
  });

  it('delivers for sign-in to an unknown recipient when registration is enabled', async () => {
    mockExperienceInteraction.signInExperienceValidator.isRegistrationDisabled.mockResolvedValueOnce(
      false
    );
    const ctx = buildSignInCtx();
    const libraries = { passcodes: mockPasscodeLibrary } as unknown as Partial<Libraries>;

    await sendCode({
      identifier: { type: SignInIdentifier.Email, value: 'newcomer@example.com' },
      interactionEvent: InteractionEvent.SignIn,
      createVerificationRecord: () => mockCodeVerification,
      libraries: libraries as unknown as Libraries,
      queries: buildUnknownUserQueries(),
      ctx: ctx as unknown as ExperienceInteractionRouterContext,
    });

    expect(mockSendVerificationCode).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ skipDelivery: false })
    );
  });

  it('delivers for sign-in binding when a user is already identified, even with registration disabled', async () => {
    // Binding a new MFA identifier: identified session, unknown recipient, registration disabled.
    mockExperienceInteraction.signInExperienceValidator.isRegistrationDisabled.mockResolvedValueOnce(
      true
    );
    const identifiedInteraction: MockExperienceInteraction = {
      ...mockExperienceInteraction,
      identifiedUserId: 'identified-user-id',
    };
    const ctx = buildSignInCtx(identifiedInteraction);
    const libraries = { passcodes: mockPasscodeLibrary } as unknown as Partial<Libraries>;

    await sendCode({
      identifier: { type: SignInIdentifier.Email, value: 'binding@example.com' },
      interactionEvent: InteractionEvent.SignIn,
      createVerificationRecord: () => mockCodeVerification,
      libraries: libraries as unknown as Libraries,
      queries: buildUnknownUserQueries(),
      ctx: ctx as unknown as ExperienceInteractionRouterContext,
    });

    expect(mockSendVerificationCode).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ skipDelivery: false })
    );
    // The identified-session guard short-circuits before consulting the registration mode.
    expect(
      mockExperienceInteraction.signInExperienceValidator.isRegistrationDisabled
    ).not.toHaveBeenCalled();
  });
});

describe('getMfaIdentifier', () => {
  const findUserById = jest
    .fn()
    .mockResolvedValue({ primaryEmail: 'foo@example.com', primaryPhone: '+11234567890' });
  const queries = { users: { findUserById } } as unknown as Queries;

  beforeEach(() => {
    findUserById.mockClear();
  });

  const buildInteraction = (factors: MfaFactor[]) =>
    ({
      identifiedUserId: 'identified-user-id',
      signInExperienceValidator: { getMfaSettings: jest.fn().mockResolvedValue({ factors }) },
    }) as unknown as Parameters<typeof getMfaIdentifier>[0]['experienceInteraction'];

  it('resolves the primary contact of the identified user when the factor is enabled', async () => {
    await expect(
      getMfaIdentifier({
        identifierType: SignInIdentifier.Email,
        experienceInteraction: buildInteraction([MfaFactor.EmailVerificationCode]),
        queries,
      })
    ).resolves.toEqual({ type: SignInIdentifier.Email, value: 'foo@example.com' });
  });

  it.each([
    [SignInIdentifier.Email, [MfaFactor.PhoneVerificationCode]],
    [SignInIdentifier.Phone, [MfaFactor.EmailVerificationCode]],
    [SignInIdentifier.Email, []],
  ] as const)(
    'refuses a %s code when the sign-in experience does not enable that factor',
    async (identifierType, factors) => {
      await expect(
        getMfaIdentifier({
          identifierType,
          experienceInteraction: buildInteraction([...factors]),
          queries,
        })
      ).rejects.toMatchError(
        new RequestError({ code: 'session.mfa.mfa_factor_not_enabled', status: 400 })
      );
      expect(findUserById).not.toHaveBeenCalled();
    }
  );

  it('refuses a code before any user is identified', async () => {
    await expect(
      getMfaIdentifier({
        identifierType: SignInIdentifier.Email,
        experienceInteraction: {
          identifiedUserId: undefined,
        } as unknown as Parameters<typeof getMfaIdentifier>[0]['experienceInteraction'],
        queries,
      })
    ).rejects.toMatchError(new RequestError({ code: 'session.identifier_not_found', status: 400 }));
  });
});
