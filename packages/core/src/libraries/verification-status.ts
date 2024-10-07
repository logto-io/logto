import { generateStandardId } from '@logto/shared';
import { type Nullable } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

const verificationTimeout = 10 * 60 * 1000; // 10 mins

export const createVerificationStatusLibrary = (queries: Queries) => {
  const {
    findVerificationStatusByUserId,
    insertVerificationStatus,
    deleteVerificationStatusesByUserId,
  } = queries.verificationStatuses;

  const createVerificationStatus = async (userId: string, identifier: Nullable<string>) => {
    // Remove existing verification statuses for current user.
    await deleteVerificationStatusesByUserId(userId);

    return insertVerificationStatus({
      id: generateStandardId(),
      userId,
      verifiedIdentifier: identifier,
    });
  };

  const checkVerificationStatus = async (
    userId: string,
    identifier: Nullable<string>
  ): Promise<void> => {
    const verificationStatus = await findVerificationStatusByUserId(userId);

    assertThat(verificationStatus, 'session.verification_session_not_found');

    // The user verification status is considered valid if the user is verified within 10 minutes.
    const isValid = Date.now() - verificationStatus.createdAt < verificationTimeout;
    assertThat(isValid, new RequestError({ code: 'session.verification_failed', status: 422 }));

    assertThat(
      !identifier || verificationStatus.verifiedIdentifier === identifier,
      new RequestError({ code: 'session.verification_failed', status: 422 })
    );
  };

  return {
    createVerificationStatus,
    checkVerificationStatus,
  };
};
