/**
 * @fileoverview
 *
 * This class is used to store and manage all the verification records.
 *
 * Since `Map` in TS does not support key - value type mapping,
 * we have to manually define a `setValue` method to ensure correct key will be set.
 *
 * - Extends the Map class and add a `setValue` method to ensure the key value type mapping.
 * - Override the `get` method to return the correct value type.
 * - Override the `set` method to throw an error to prevent using it directly.
 */
import { type VerificationType } from '@logto/schemas';

import { type VerificationRecord, type VerificationRecordMap } from './index.js';

export class VerificationRecordsMap extends Map<VerificationType, VerificationRecord> {
  setValue(value: VerificationRecord) {
    return super.set(value.type, value);
  }

  override get<K extends keyof VerificationRecordMap>(
    key: K
  ): VerificationRecordMap[K] | undefined {
    // eslint-disable-next-line no-restricted-syntax
    return super.get(key) as VerificationRecordMap[K] | undefined;
  }

  override set(): never {
    throw new Error('Use `setValue` method to set the value');
  }

  array(): VerificationRecord[] {
    return [...this.values()];
  }
}
