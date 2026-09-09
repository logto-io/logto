/**
 * @file Identifier resolution for the pinned-user verification code variants, where the request
 * carries only the identifier type and the value comes from the subject the interaction carries.
 */
import {
  SignInIdentifier,
  type VerificationCodeIdentifier,
  type VerificationCodeSignInIdentifier,
  type VerificationType,
} from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import type ExperienceInteraction from '../classes/experience-interaction.js';

type GetSubjectIdentifierParams = {
  identifierType: VerificationCodeSignInIdentifier;
  experienceInteraction: ExperienceInteraction;
  queries: Queries;
};

/**
 * Resolve the subject's primary email / phone to send a code to.
 *
 * @throws {RequestError} with 404 if the interaction carries no subject or the subject has no
 * primary identifier of that type
 * @internal
 */
export const getSubjectIdentifier = async ({
  identifierType,
  experienceInteraction,
  queries,
}: GetSubjectIdentifierParams): Promise<{
  userId: string;
  identifier: VerificationCodeIdentifier;
}> => {
  const { subjectUserId } = experienceInteraction;

  assertThat(
    subjectUserId,
    new RequestError({ code: 'session.identifier_not_found', status: 404 })
  );

  const { primaryEmail, primaryPhone } = await queries.users.findUserById(subjectUserId);
  const value = identifierType === SignInIdentifier.Email ? primaryEmail : primaryPhone;

  assertThat(value, new RequestError({ code: 'session.identifier_not_found', status: 404 }));

  return { userId: subjectUserId, identifier: { type: identifierType, value } };
};

type GetSubjectCodeRecordIdentifierParams = {
  verificationType: VerificationType.EmailVerificationCode | VerificationType.PhoneVerificationCode;
  verificationId: string;
  experienceInteraction: ExperienceInteraction;
};

/**
 * Resolve the identifier a code was sent to by {@link getSubjectIdentifier} from the record.
 *
 * @throws {RequestError} with 404 if the interaction carries no subject, or the record is not
 * found or was not created for the subject
 * @internal
 */
export const getSubjectCodeRecordIdentifier = ({
  verificationType,
  verificationId,
  experienceInteraction,
}: GetSubjectCodeRecordIdentifierParams): VerificationCodeIdentifier => {
  const { subjectUserId } = experienceInteraction;

  assertThat(
    subjectUserId,
    new RequestError({ code: 'session.identifier_not_found', status: 404 })
  );

  const record = experienceInteraction.getVerificationRecordByTypeAndId(
    verificationType,
    verificationId
  );

  assertThat(
    record.userId === subjectUserId,
    new RequestError({ code: 'session.verification_session_not_found', status: 404 })
  );

  return record.identifier;
};
