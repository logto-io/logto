import { expirationTime } from '../queries/verification-records.js';
import {
  buildVerificationRecord,
  verificationRecordDataGuard,
} from '../routes/experience/classes/verifications/index.js';
import { type VerificationRecord } from '../routes/experience/classes/verifications/verification-record.js';
import type Libraries from '../tenants/Libraries.js';
import type Queries from '../tenants/Queries.js';
import assertThat from '../utils/assert-that.js';

export const buildUserVerificationRecordById = async (
  userId: string,
  id: string,
  queries: Queries,
  libraries: Libraries
) => {
  const record = await queries.verificationRecords.findUserActiveVerificationRecordById(userId, id);
  assertThat(record, 'verification_record.not_found');

  const result = verificationRecordDataGuard.safeParse({
    ...record.data,
    id: record.id,
  });

  assertThat(result.success, 'verification_record.not_found');

  return buildVerificationRecord(libraries, queries, result.data);
};

export const saveVerificationRecord = async (
  userId: string,
  verificationRecord: VerificationRecord,
  queries: Queries
) => {
  const { id, ...rest } = verificationRecord.toJson();

  return queries.verificationRecords.upsertRecord({
    id,
    userId,
    data: rest,
    expiresAt: new Date(Date.now() + expirationTime).valueOf(),
  });
};
