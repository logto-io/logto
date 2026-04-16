import { InteractionEvent, SignInIdentifier } from '@logto/schemas';

import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

import type { EmailCodeVerification } from '../classes/verifications/code-verification.js';
import type { ExperienceInteractionRouterContext } from '../types.js';

type MockExperienceInteraction = {
  interactionEvent: InteractionEvent;
  setVerificationRecord: jest.MockedFunction<() => Promise<void>>;
  save: jest.MockedFunction<() => Promise<void>>;
  signInExperienceValidator: {
    guardEmailBlocklist: jest.MockedFunction<() => Promise<void>>;
  };
};

const { jest } = import.meta;

async function resolveVoid(): Promise<void> {
  await Promise.resolve();
}

const { sendCode } = await import('./verification-code-helpers.js');

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
    },
  };

  const mockBuildVerificationCodeContext = jest.fn().mockImplementation(resolveVoid);
  const mockPasscodeLibrary = {
    buildVerificationCodeContext: mockBuildVerificationCodeContext,
  };

  const mockQueries = {
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
    expect(mockSendVerificationCode).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ skipDelivery: true })
    );
  });

  it('should not skip delivery for forgot-password with existing user', async () => {
    const mockQueriesWithUser = {
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
});
