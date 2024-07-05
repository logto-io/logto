import { VerificationType } from '@logto/schemas';
import { z } from 'zod';

import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

import {
  PasswordVerification,
  passwordVerificationRecordDataGuard,
  type PasswordVerificationRecordData,
} from './password-verification.js';
import { type VerificationRecord } from './verification-record.js';

export { type VerificationRecord } from './verification-record.js';

type VerificationRecordData = PasswordVerificationRecordData;

export const verificationRecordDataGuard = z.discriminatedUnion('type', [
  passwordVerificationRecordDataGuard,
]);

/**
 * The factory method to build a new `VerificationRecord` instance based on the provided `VerificationRecordData`.
 */
export const buildVerificationRecord = <T extends VerificationRecordData>(
  libraries: Libraries,
  queries: Queries,
  data: T
): VerificationRecord<T['type']> => {
  switch (data.type) {
    case VerificationType.Password: {
      return new PasswordVerification(libraries, queries, data);
    }
  }
};
