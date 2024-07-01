import { VerificationType } from '@logto/schemas';
import { z } from 'zod';

import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

import {
  CodeVerification,
  codeVerificationRecordDataGuard,
  type CodeVerificationRecordData,
} from './code-verification.js';
import {
  PasswordVerification,
  passwordVerificationRecordDataGuard,
  type PasswordVerificationRecordData,
} from './password-verification.js';
import {
  SocialVerification,
  socialVerificationRecordDataGuard,
  type SocialVerificationRecordData,
} from './social-verification.js';

type VerificationRecordData =
  | PasswordVerificationRecordData
  | CodeVerificationRecordData
  | SocialVerificationRecordData;

export const verificationRecordDataGuard = z.discriminatedUnion('type', [
  passwordVerificationRecordDataGuard,
  codeVerificationRecordDataGuard,
  socialVerificationRecordDataGuard,
]);

export type VerificationRecord = PasswordVerification | CodeVerification | SocialVerification;

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
      return new CodeVerification(libraries, queries, data);
    }
    case VerificationType.Social: {
      return new SocialVerification(libraries, queries, data);
    }
  }
};
