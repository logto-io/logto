import {
  InteractionEvent,
  InteractionIdentifierType,
  VerificationType,
  type InteractionIdentifier,
} from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { type VerificationRecord } from './verifications/index.js';

export const findUserByIdentifier = async (
  userQuery: Queries['users'],
  { type, value }: InteractionIdentifier
) => {
  switch (type) {
    case InteractionIdentifierType.Username: {
      return userQuery.findUserByUsername(value);
    }
    case InteractionIdentifierType.Email: {
      return userQuery.findUserByEmail(value);
    }
    case InteractionIdentifierType.Phone: {
      return userQuery.findUserByPhone(value);
    }
  }
};

/**
 * Check if the verification record is valid for the current interaction event.
 *
 * This function will compare the verification record for the current interaction event with Logto's SIE settings
 *
 * @throws RequestError with 400 if the verification record is not valid for the current interaction event
 */
export const validateSieVerificationMethod = (
  interactionEvent: InteractionEvent,
  verificationRecord: VerificationRecord
) => {
  switch (interactionEvent) {
    case InteractionEvent.SignIn: {
      // TODO: sign-in methods validation
      break;
    }
    case InteractionEvent.Register: {
      // TODO: sign-up methods validation
      break;
    }
    case InteractionEvent.ForgotPassword: {
      // Forgot password only supports verification code type verification record
      // The verification record's interaction event must be ForgotPassword
      assertThat(
        verificationRecord.type === VerificationType.VerificationCode &&
          verificationRecord.interactionEvent === InteractionEvent.ForgotPassword,
        new RequestError({ code: 'session.verification_session_not_found', status: 400 })
      );
      break;
    }
  }
};
