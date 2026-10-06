import { InteractionEvent, SignInIdentifier } from '@logto/schemas';

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

const { sendCode } = await import('./verification-code-helpers.js');

// Provide a permissive activity store so the message rate guard allows sends by default.
const mockSentinelActivities = {
  countActivities: jest.fn().mockResolvedValue(0),
  insertActivity: jest.fn().mockImplementation(resolveVoid),
};

// `buildMessageRateGuard` reads the per-tenant override; default to none so the system policy applies.
const mockLogtoConfigs = {
  getMessageRateLimitOverride: jest.fn().mockResolvedValue(null),
};

// Passcode context builder used for email sends; not relevant to these assertions.
const mockPasscodeLibrary = {
  buildVerificationCodeContext: jest.fn().mockResolvedValue({}),
};

describe('sendCode email blocklist pre-check for registerable sign-ins', () => {
  const mockSendVerificationCode = jest.fn().mockImplementation(resolveVoid);

  const mockCodeVerification = {
    id: 'blocklist-test-verification-id',
    sendVerificationCode: mockSendVerificationCode,
  } as unknown as EmailCodeVerification;

  const mockExperienceInteraction: MockExperienceInteraction = {
    interactionEvent: InteractionEvent.SignIn,
    setVerificationRecord: jest.fn().mockImplementation(resolveVoid),
    save: jest.fn().mockImplementation(resolveVoid),
    signInExperienceValidator: {
      guardEmailBlocklist: jest.fn().mockImplementation(resolveVoid),
      // Default: registration is enabled.
      isRegistrationDisabled: jest.fn().mockResolvedValue(false),
    },
  };

  const buildUnknownUserQueries = () =>
    ({
      sentinelActivities: mockSentinelActivities,
      logtoConfigs: mockLogtoConfigs,
      users: {
        hasUserWithEmail: jest.fn().mockResolvedValue(false),
        hasUserWithNormalizedPhone: jest.fn().mockResolvedValue(false),
      },
    }) as unknown as Queries;

  const buildSignInCtx = (interaction = mockExperienceInteraction) => ({
    request: { ip: '127.0.0.1' },
    createLog: jest.fn(() => ({ append: jest.fn().mockImplementation(resolveVoid) })),
    appendExceptionHookContext: jest.fn(),
    experienceInteraction: interaction,
    emailI18n: {},
  });

  const runSendCode = async ({
    email,
    queries,
    ctx,
  }: {
    email: string;
    queries: Queries;
    ctx: unknown;
  }) =>
    sendCode({
      identifier: { type: SignInIdentifier.Email, value: email },
      interactionEvent: InteractionEvent.SignIn,
      createVerificationRecord: () => mockCodeVerification,
      libraries: { passcodes: mockPasscodeLibrary } as unknown as Libraries,
      queries,
      ctx: ctx as ExperienceInteractionRouterContext,
    });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSendVerificationCode.mockImplementation(resolveVoid);
    mockExperienceInteraction.save.mockImplementation(resolveVoid);
  });

  it('guards the blocklist for sign-in to an unknown email when registration is enabled', async () => {
    // Identifier-first sign-in: an unidentified session with an email no user owns and registration
    // enabled can only become a Register after the code is verified, so the blocklist must reject
    // at send time instead of after the email was already delivered.
    mockExperienceInteraction.signInExperienceValidator.guardEmailBlocklist.mockRejectedValueOnce(
      new RequestError({ code: 'session.email_blocklist.email_not_allowed', status: 422 })
    );
    const ctx = buildSignInCtx();

    await expect(
      runSendCode({
        email: 'blocked@example.com',
        queries: buildUnknownUserQueries(),
        ctx,
      })
    ).rejects.toMatchObject({ code: 'session.email_blocklist.email_not_allowed', status: 422 });

    expect(
      mockExperienceInteraction.signInExperienceValidator.guardEmailBlocklist
    ).toHaveBeenCalledWith(mockCodeVerification);
    expect(mockSendVerificationCode).not.toHaveBeenCalled();
  });

  it.each([
    ['an email a user already owns', 'member@example.com'],
    ['an unknown email when registration is disabled', 'stranger@example.com'],
  ])('does not guard the blocklist for sign-in to %s', async (_name, email) => {
    const ctx = buildSignInCtx();
    const queries =
      email === 'member@example.com'
        ? ({
            sentinelActivities: mockSentinelActivities,
            logtoConfigs: mockLogtoConfigs,
            users: {
              hasUserWithEmail: jest.fn().mockResolvedValue(true),
              hasUserWithNormalizedPhone: jest.fn().mockResolvedValue(true),
            },
          } as unknown as Queries)
        : buildUnknownUserQueries();

    if (email === 'stranger@example.com') {
      mockExperienceInteraction.signInExperienceValidator.isRegistrationDisabled.mockResolvedValueOnce(
        true
      );
    }

    await runSendCode({ email, queries, ctx });

    expect(
      mockExperienceInteraction.signInExperienceValidator.guardEmailBlocklist
    ).not.toHaveBeenCalled();
  });

  it('does not guard the blocklist for sign-in sends from an identified session', async () => {
    // Binding a new MFA identifier in an identified session is not a registration.
    const identifiedInteraction: MockExperienceInteraction = {
      ...mockExperienceInteraction,
      identifiedUserId: 'identified-user-id',
    };
    const ctx = buildSignInCtx(identifiedInteraction);

    await sendCode({
      identifier: { type: SignInIdentifier.Email, value: 'binding@example.com' },
      interactionEvent: InteractionEvent.SignIn,
      createVerificationRecord: () => mockCodeVerification,
      libraries: { passcodes: mockPasscodeLibrary } as unknown as Libraries,
      queries: buildUnknownUserQueries(),
      ctx: ctx as unknown as ExperienceInteractionRouterContext,
    });

    expect(
      identifiedInteraction.signInExperienceValidator.guardEmailBlocklist
    ).not.toHaveBeenCalled();
  });

  it('never guards the blocklist for phone sends', async () => {
    const ctx = buildSignInCtx();
    const queries = buildUnknownUserQueries();

    await sendCode({
      identifier: { type: SignInIdentifier.Phone, value: '+8613123456789' },
      interactionEvent: InteractionEvent.SignIn,
      createVerificationRecord: () => mockCodeVerification,
      libraries: { passcodes: mockPasscodeLibrary } as unknown as Libraries,
      queries,
      ctx: ctx as unknown as ExperienceInteractionRouterContext,
    });

    expect(
      mockExperienceInteraction.signInExperienceValidator.guardEmailBlocklist
    ).not.toHaveBeenCalled();
  });
});
