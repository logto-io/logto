import { SignInIdentifier, VerificationType } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';

import type ExperienceInteraction from '../classes/experience-interaction.js';

import {
  getSubjectCodeRecordIdentifier,
  getSubjectIdentifier,
} from './pinned-verification-code-helpers.js';

const { jest } = import.meta;

const subjectUserId = 'subject-user-id';
const identifier = { type: SignInIdentifier.Email, value: 'foo@example.com' };

const buildInteraction = (
  subject?: string,
  record?: Record<string, unknown>
): ExperienceInteraction =>
  ({
    subjectUserId: subject,
    getVerificationRecordByTypeAndId: jest.fn().mockReturnValue(record),
  }) as unknown as ExperienceInteraction;

describe('getSubjectIdentifier', () => {
  const findUserById = jest
    .fn()
    .mockResolvedValue({ primaryEmail: 'foo@example.com', primaryPhone: '+11234567890' });
  const queries = { users: { findUserById } } as unknown as Queries;

  beforeEach(() => {
    findUserById.mockClear();
  });

  it.each([
    [SignInIdentifier.Email, 'foo@example.com'],
    [SignInIdentifier.Phone, '+11234567890'],
  ] as const)('resolves the primary %s of the subject', async (identifierType, value) => {
    await expect(
      getSubjectIdentifier({
        identifierType,
        experienceInteraction: buildInteraction(subjectUserId),
        queries,
      })
    ).resolves.toEqual({ userId: subjectUserId, identifier: { type: identifierType, value } });
    expect(findUserById).toHaveBeenCalledWith(subjectUserId);
  });

  it('refuses the pinned-user shape before the interaction carries a subject', async () => {
    await expect(
      getSubjectIdentifier({
        identifierType: SignInIdentifier.Email,
        experienceInteraction: buildInteraction(),
        queries,
      })
    ).rejects.toMatchError(new RequestError({ code: 'session.identifier_not_found', status: 404 }));
    expect(findUserById).not.toHaveBeenCalled();
  });

  it('refuses a type the subject has no primary identifier of', async () => {
    findUserById.mockResolvedValueOnce({ primaryEmail: null, primaryPhone: '+11234567890' });

    await expect(
      getSubjectIdentifier({
        identifierType: SignInIdentifier.Email,
        experienceInteraction: buildInteraction(subjectUserId),
        queries,
      })
    ).rejects.toMatchError(new RequestError({ code: 'session.identifier_not_found', status: 404 }));
  });
});

describe('getSubjectCodeRecordIdentifier', () => {
  it('resolves the identifier the code was sent to from a record created for the subject', () => {
    const experienceInteraction = buildInteraction(subjectUserId, {
      userId: subjectUserId,
      identifier,
    });

    expect(
      getSubjectCodeRecordIdentifier({
        verificationType: VerificationType.EmailVerificationCode,
        verificationId: 'verification-id',
        experienceInteraction,
      })
    ).toEqual(identifier);
    expect(experienceInteraction.getVerificationRecordByTypeAndId).toHaveBeenCalledWith(
      VerificationType.EmailVerificationCode,
      'verification-id'
    );
  });

  it('refuses the pinned-user shape before the interaction carries a subject', () => {
    expect(() =>
      getSubjectCodeRecordIdentifier({
        verificationType: VerificationType.EmailVerificationCode,
        verificationId: 'verification-id',
        experienceInteraction: buildInteraction(undefined, { userId: subjectUserId, identifier }),
      })
    ).toThrow(new RequestError({ code: 'session.identifier_not_found', status: 404 }));
  });

  it('refuses a record that was not created for the subject', () => {
    expect(() =>
      getSubjectCodeRecordIdentifier({
        verificationType: VerificationType.EmailVerificationCode,
        verificationId: 'verification-id',
        experienceInteraction: buildInteraction(subjectUserId, { identifier }),
      })
    ).toThrow(new RequestError({ code: 'session.verification_session_not_found', status: 404 }));
  });
});
