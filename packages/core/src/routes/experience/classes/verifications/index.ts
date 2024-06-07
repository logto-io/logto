import { VerificationType } from '@logto/schemas';
import { z } from 'zod';

import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

import {
  PasswordVerification,
  passwordVerificationRecordDataGuard,
  type PasswordVerificationRecordData,
} from './password-verification.js';
import {
  VerificationCodeVerification,
  verificationCodeVerificationRecordDataGuard,
  type VerificationCodeVerificationRecordData,
} from './verification-code-verification.js';

export { PasswordVerification } from './password-verification.js';

type VerificationRecordData =
  | PasswordVerificationRecordData
  | VerificationCodeVerificationRecordData;

export const verificationRecordDataGuard = z.discriminatedUnion('type', [
  passwordVerificationRecordDataGuard,
  verificationCodeVerificationRecordDataGuard,
]);

export type VerificationRecord = PasswordVerification | VerificationCodeVerification;

export const buildVerificationRecord = (
  libraries: Libraries,
  queries: Queries,
  data: VerificationRecordData
) => {
  switch (data.type) {
    case VerificationType.Password: {
      return new PasswordVerification(libraries, queries, data);
    }
    case VerificationType.VerificationCode: {
      return new VerificationCodeVerification(libraries, queries, data);
    }
  }
};
