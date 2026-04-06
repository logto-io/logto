import { InteractionEvent, SignInIdentifier } from '@logto/schemas';

const { jest } = import.meta;

async function resolveVoid(): Promise<void> {
  await Promise.resolve();
}

const { sendCode } = await import('./verification-code-helpers.js');

describe('Verification The function sendCode parameters passing', () => {
  // To make a void callable function/method
  const mockSendVerificationCode = jest.fn().mockImplementation(resolveVoid);

  const mockCodeVerification = {
    id: 'helper-test-verification-id',
    sendVerificationCode: mockSendVerificationCode,
  };

  const mockExperienceInteraction = {
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockSendVerificationCode.mockImplementation(resolveVoid);
    mockExperienceInteraction.save.mockImplementation(resolveVoid);
    mockBuildVerificationCodeContext.mockResolvedValue({});
  });

  it('should pass ctx.ip to sendVerificationCode', async () => {
    const SAMPLE_IP = '192.168.1.225';

    const ctx = {
      ip: SAMPLE_IP,
      createLog: jest.fn(() => ({ append: jest.fn().mockImplementation(resolveVoid) })),
      experienceInteraction: mockExperienceInteraction,
      emailI18n: { locale: 'jp' },
    };

    // Only verify the ip parameter so use never to ignore others at here to bypass type check
    const libraries = { passcodes: mockPasscodeLibrary };
    await sendCode({
      identifier: { type: SignInIdentifier.Phone, value: '+8613123456789' },
      createVerificationRecord: () => mockCodeVerification as never,
      libraries: libraries as never,
      ctx: ctx as never,
    });

    expect(mockSendVerificationCode).toHaveBeenCalledWith(
      expect.objectContaining({
        ip: SAMPLE_IP,
      })
    );
  });
  it('should handle undefined ctx.ip', async () => {
    const ctx = {
      createLog: jest.fn(() => ({ append: jest.fn().mockImplementation(resolveVoid) })),
      experienceInteraction: mockExperienceInteraction,
      emailI18n: { locale: 'jp' },
    };

    const libraries = { passcodes: mockPasscodeLibrary };
    await sendCode({
      identifier: { type: SignInIdentifier.Phone, value: '+8613123456789' },
      createVerificationRecord: () => mockCodeVerification as never,
      libraries: libraries as never,
      ctx: ctx as never,
    });

    expect(mockSendVerificationCode).toHaveBeenCalledWith(
      expect.objectContaining({
        ip: undefined,
      })
    );
  });
});
