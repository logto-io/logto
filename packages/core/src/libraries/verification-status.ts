import { generateStandardId } from '@logto/core-kit';

import RequestError from '#src/errors/RequestError/index.js';
import { verificationTimeout } from '#src/routes/consts.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

export type VerificationStatusLibrary = ReturnType<typeof createVerificationStatusLibrary>;

export const createVerificationStatusLibrary = (queries: Queries) => {
  const {
    findVerificationStatusByUserIdAndSessionId,
    insertVerificationStatus,
    deleteVerificationStatusesByUserIdAndSessionId,
  } = queries.verificationStatuses;

  const createVerificationStatus = async (userId: string, sessionId: string) => {
    // Remove existing verification statuses for current user in current session.
    await deleteVerificationStatusesByUserIdAndSessionId(userId, sessionId);

    // When creating new verification record, we use session ID to identify the client device.
    // The session ID is a cookie value, which is unique for each client.
    // This prevents the user from proceeding after being verified on another device.
    return insertVerificationStatus({
      id: generateStandardId(),
      sessionId,
      userId,
    });
  };

  const checkVerificationStatus = async (userId: string, sessionId: string): Promise<void> => {
    const verificationStatus = await findVerificationStatusByUserIdAndSessionId(userId, sessionId);

    assertThat(verificationStatus, 'session.verification_session_not_found');

    const { sessionId: storedSessionId, createdAt } = verificationStatus;

    // The user verification status is considered valid if:
    // 1. The user is verified within 10 minutes.
    // 2. The user is verified with the same client session (cookie).
    const isValid =
      Date.now() - createdAt < verificationTimeout &&
      Boolean(sessionId) &&
      storedSessionId === sessionId;

    assertThat(isValid, new RequestError({ code: 'session.verification_failed', status: 422 }));
  };

  return { createVerificationStatus, checkVerificationStatus };
};
