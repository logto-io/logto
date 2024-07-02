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

const typeToVerificationRecordConstructor = Object.freeze({
  [VerificationType.Password]: PasswordVerification,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- https://www.typescriptlang.org/docs/handbook/2/classes.html#abstract-construct-signatures
}) satisfies Partial<Record<VerificationType, new (...args: any[]) => VerificationRecord>>;

export const buildVerificationRecord = (
  libraries: Libraries,
  queries: Queries,
  data: VerificationRecordData
) => new typeToVerificationRecordConstructor[data.type](libraries, queries, data);
