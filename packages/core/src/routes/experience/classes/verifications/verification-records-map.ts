/**
 * @fileoverview
 *
 * Since map in TS does not support  key value type mapping,
 * we have to manually define a `setValue` method to ensure the key value type mapping.
 * This class is used to store and manage all the verification records.
 *
 * Extends the Map class and adds a `setValue` method to ensure the key value type mapping.
 */

import { type VerificationType } from '@logto/schemas';

import assertThat from '#src/utils/assert-that.js';

import { type VerificationRecord, type VerificationRecordMap } from './index.js';

export class VerificationRecordsMap extends Map<VerificationType, VerificationRecord> {
  setValue(value: VerificationRecord) {
    return this.set(value.type, value);
  }

  getValue<K extends keyof VerificationRecordMap>(key: K): VerificationRecordMap[K] | undefined {
    const record = super.get(key);

    if (!record) {
      return undefined;
    }

    assertThat(
      record.type === key,
      new TypeError(`Verification record type mismatch. Expected ${key}, but got ${record.type}.`)
    );

    // eslint-disable-next-line no-restricted-syntax -- Type assertion above ensures the type safety
    return record as VerificationRecordMap[K];
  }

  toArray(): VerificationRecord[] {
    return [...this.values()];
  }
}
