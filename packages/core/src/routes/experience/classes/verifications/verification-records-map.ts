/**
 * @overview Since map in TS does not support strict key value type checking, we have to manually define the key value type.
 * This class is used to store and manage all the verification records.
 * We override the set and get methods to ensure the type safety of the verification record.
 */

import { type VerificationType } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

import { type VerificationRecord, type VerificationRecordMap } from './index.js';

type VerificationRecordKey<T extends VerificationRecord> = T['type'];

export class VerificationRecordsMap {
  readonly #map = new Map<VerificationType, VerificationRecord>();

  set<V extends VerificationRecord>(key: VerificationRecordKey<V>, value: V): void {
    this.#map.set(key, value);
  }

  get<K extends keyof VerificationRecordMap>(key: K): VerificationRecordMap[K] | undefined {
    const record = this.#map.get(key);

    assertThat(
      record?.type === key,
      new RequestError({ code: 'session.verification_session_not_found', status: 404 })
    );

    // eslint-disable-next-line no-restricted-syntax -- We are sure that the record is of type K
    return this.#map.get(key) as VerificationRecordMap[K];
  }

  toArray(): VerificationRecord[] {
    return [...this.#map.values()];
  }
}
