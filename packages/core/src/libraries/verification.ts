import { expirationTime } from '../queries/verification-records.js';
import {
  buildVerificationRecord,
  verificationRecordDataGuard,
  type VerificationRecordMap,
} from '../routes/experience/classes/verifications/index.js';
import { type VerificationRecord } from '../routes/experience/classes/verifications/verification-record.js';
import { VerificationRecordsMap } from '../routes/experience/classes/verifications/verification-records-map.js';
import type Libraries from '../tenants/Libraries.js';
import type Queries from '../tenants/Queries.js';
import assertThat from '../utils/assert-that.js';

/**
 * Builds a verification record by its id.
 * The `userId` is optional and is only used for user sensitive permission verifications.
 */
const getVerificationRecordById = async ({
  id,
  queries,
  libraries,
  userId,
}: {
  id: string;
  queries: Queries;
  libraries: Libraries;
  userId?: string;
}) => {
  const record = await queries.verificationRecords.findActiveVerificationRecordById(id);
  assertThat(record, 'verification_record.not_found');

  if (userId) {
    assertThat(record.userId === userId, 'verification_record.not_found');
  }

  const result = verificationRecordDataGuard.safeParse({
    ...record.data,
    id: record.id,
  });

  assertThat(result.success, 'verification_record.not_found');

  return buildVerificationRecord(libraries, queries, result.data);
};

/**
 * Builds a user verification record by its id and type.
 * This is used to build a verification record for new identifier verifications,
 * and may not be associated with a user.
 */
export const buildVerificationRecordByIdAndType = async <K extends keyof VerificationRecordMap>({
  type,
  id,
  queries,
  libraries,
}: {
  type: K;
  id: string;
  queries: Queries;
  libraries: Libraries;
}): Promise<VerificationRecordMap[K]> => {
  const records = new VerificationRecordsMap();
  records.setValue(await getVerificationRecordById({ id, queries, libraries }));

  const instance = records.get(type);

  assertThat(instance?.type === type, 'verification_record.not_found');

  return instance;
};

export const insertVerificationRecord = async (
  verificationRecord: VerificationRecord,
  queries: Queries,
  // For new identifier verifications, the user id should be empty
  userId?: string
) => {
  const { id, ...rest } = verificationRecord.toJson();

  return queries.verificationRecords.insert({
    id,
    userId,
    data: rest,
    expiresAt: new Date(Date.now() + expirationTime).valueOf(),
  });
};

// The upsert query can not update JSONB fields, so we need to use the update query
export const updateVerificationRecord = async (
  verificationRecord: VerificationRecord,
  queries: Queries
) => {
  const { id, ...rest } = verificationRecord.toJson();

  return queries.verificationRecords.update({
    where: { id },
    set: { data: rest },
    jsonbMode: 'replace',
  });
};
