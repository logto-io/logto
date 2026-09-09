/**
 * @file Identifier resolution for the pinned-user verification code variants: a code request or
 * verification that carries only the identifier type, once the interaction already carries a
 * subject (a pinned step-up subject or an identified user). The subject is read from the
 * interaction storage, never from the client, so neither request carries a raw identifier.
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
 * Resolve the identifier of a pinned-user code request: the primary email / phone of the subject
 * the interaction already carries, a pinned step-up subject or an identified user. The subject is
 * read from the interaction storage, never from the client, so the request carries no raw
 * identifier; the resolved identifier is what the sentinel lockout is keyed on, so a step-up and a
 * sign-in with that email / phone share one bucket.
 *
 * @throws {RequestError} with 404 if the interaction carries no subject
 * @throws {RequestError} with 404 if the subject has no primary identifier of that type
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
 * Resolve the identifier of a pinned-user code verification: the identifier the code was sent to
 * by {@link getSubjectIdentifier}, read from the record rather than from the client. The record
 * must have been created for the subject the interaction carries; a record created from a
 * client-supplied identifier keeps its own contract and restates the identifier.
 *
 * @throws {RequestError} with 404 if the interaction carries no subject
 * @throws {RequestError} with 404 if the record is not found or was not created for the subject
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
