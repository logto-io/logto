import { generateStandardId } from '@logto/shared/universal';

import type { CreateCustomProfileField } from '../db-entries/index.js';
import { CustomProfileFieldType } from '../foundations/index.js';

import { defaultTenantId } from './tenant.js';

/**
 * Create the default custom profile fields for a tenant.
 *
 * This seeds a `Fullname` composite field that collects:
 * - `givenName` (enabled, optional)
 * - `familyName` (enabled, **required**)
 */
export const createDefaultCustomProfileFields = (
  forTenantId: string
): Readonly<CreateCustomProfileField> =>
  Object.freeze({
    tenantId: forTenantId,
    id: generateStandardId(),
    name: 'fullname',
    type: CustomProfileFieldType.Fullname,
    required: true,
    sieOrder: 1,
    config: {
      parts: [
        {
          name: 'givenName',
          type: CustomProfileFieldType.Text,
          config: { maxLength: 100, minLength: 1 },
          label: 'First Name',
          enabled: true,
          required: false,
        },
        {
          name: 'middleName',
          type: CustomProfileFieldType.Text,
          config: { maxLength: 100, minLength: 1 },
          enabled: false,
          required: false,
        },
        {
          name: 'familyName',
          type: CustomProfileFieldType.Text,
          config: { maxLength: 100, minLength: 1 },
          label: 'Last Name',
          enabled: true,
          required: true,
        },
      ],
    },
  });

/** @deprecated Use `createDefaultCustomProfileFields()` instead. */
export const defaultCustomProfileFields = createDefaultCustomProfileFields(defaultTenantId);
