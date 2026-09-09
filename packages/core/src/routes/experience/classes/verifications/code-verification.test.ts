import { TemplateType } from '@logto/connector-kit';
import { SignInIdentifier, VerificationType } from '@logto/schemas';
import { maskEmail, maskPhone } from '@logto/shared';

import { mockUser } from '#src/__mocks__/user.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type PasscodeLibrary } from '#src/libraries/passcode.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

import { createSubjectCodeVerificationRecord, EmailCodeVerification } from './code-verification.js';

const { jest } = import.meta;

describe('EmailCodeVerification', () => {
  it('should create passcode without sending when delivery is skipped', async () => {
    const createPasscode = jest.fn().mockResolvedValue({
      tenantId: 'fake_tenant',
      id: 'passcode_id',
      interactionJti: 'verification_id',
      phone: null,
      email: 'foo@example.com',
      type: TemplateType.ForgotPassword,
      code: '123456',
      consumed: false,
      tryCount: 0,
      createdAt: Date.now(),
    });
    const sendPasscode = jest.fn();
    const libraries = {
      passcodes: {
        createPasscode,
        sendPasscode,
      } as unknown as PasscodeLibrary,
    } as unknown as Libraries;

    const verification = new EmailCodeVerification(libraries, {} as unknown as Queries, {
      id: 'verification_id',
      type: VerificationType.EmailVerificationCode,
      identifier: {
        type: SignInIdentifier.Email,
        value: 'foo@example.com',
      },
      templateType: TemplateType.ForgotPassword,
      verified: false,
    });

    await verification.sendVerificationCode({ locale: 'en' }, { skipDelivery: true });

    expect(createPasscode).toHaveBeenCalledWith('verification_id', TemplateType.ForgotPassword, {
      email: 'foo@example.com',
    });
    expect(sendPasscode).not.toHaveBeenCalled();
  });
});

describe('CodeVerification created for the subject', () => {
  const findUserById = jest.fn().mockResolvedValue(mockUser);
  const findUserByEmail = jest.fn();
  const findUserByNormalizedPhone = jest.fn();
  const queries = {
    users: { findUserById, findUserByEmail, findUserByNormalizedPhone },
  } as unknown as Queries;
  const libraries = {} as unknown as Libraries;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    {
      identifier: { type: SignInIdentifier.Email, value: 'foo@example.com' },
      type: VerificationType.EmailVerificationCode,
      masked: maskEmail('foo@example.com'),
    },
    {
      identifier: { type: SignInIdentifier.Phone, value: '+11234567890' },
      type: VerificationType.PhoneVerificationCode,
      masked: maskPhone('+11234567890'),
    },
  ] as const)(
    'carries the subject, identifies it by id, and exposes only the masked $identifier.type',
    async ({ identifier, type, masked }) => {
      const verification = createSubjectCodeVerificationRecord(
        libraries,
        queries,
        identifier,
        mockUser.id
      );

      expect(verification.type).toBe(type);
      expect(verification.userId).toBe(mockUser.id);
      expect(verification.templateType).toBe(TemplateType.SignIn);
      expect(verification.toJson()).toMatchObject({ identifier, userId: mockUser.id });
      expect(verification.toSanitizedJson()).toMatchObject({
        identifier: { type: identifier.type, value: masked },
        userId: mockUser.id,
      });
      expect(JSON.stringify(verification.toSanitizedJson())).not.toContain(identifier.value);

      // Not verified yet
      await expect(verification.identifyUser()).rejects.toMatchError(
        new RequestError({ code: 'session.verification_failed', status: 400 })
      );

      const restored = createSubjectCodeVerificationRecord(
        libraries,
        queries,
        identifier,
        mockUser.id
      );
      // The round-trip keeps the subject.
      const data = { ...restored.toJson(), verified: true };
      const verified = new EmailCodeVerification(libraries, queries, {
        ...data,
        type: VerificationType.EmailVerificationCode,
        identifier: { type: SignInIdentifier.Email, value: identifier.value },
      });

      await expect(verified.identifyUser()).resolves.toEqual(mockUser);
      expect(findUserById).toHaveBeenCalledWith(mockUser.id);
      expect(findUserByEmail).not.toHaveBeenCalled();
      expect(findUserByNormalizedPhone).not.toHaveBeenCalled();
    }
  );

  it('keeps the raw identifier and the identifier lookup for a record created from a client-supplied identifier', async () => {
    const identifier = { type: SignInIdentifier.Email, value: 'foo@example.com' } as const;
    const verification = new EmailCodeVerification(libraries, queries, {
      id: 'verification_id',
      type: VerificationType.EmailVerificationCode,
      identifier,
      templateType: TemplateType.SignIn,
      verified: true,
    });

    findUserByEmail.mockResolvedValueOnce(mockUser);

    expect(verification.userId).toBeUndefined();
    expect(verification.toJson()).not.toHaveProperty('userId');
    expect(verification.toSanitizedJson().identifier).toEqual(identifier);
    await expect(verification.identifyUser()).resolves.toEqual(mockUser);
    expect(findUserByEmail).toHaveBeenCalledWith(identifier.value);
    expect(findUserById).not.toHaveBeenCalled();
  });
});
