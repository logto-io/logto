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
    name: 'name',
    type: CustomProfileFieldType.Fullname,
    label: 'Full name',
    required: true,
    sieOrder: 1,
    config: {
      parts: [
        {
          enabled: true,
          name: 'givenName',
          type: CustomProfileFieldType.Text,
          label: 'Given name',
          required: false,
        },
        {
          enabled: false,
          name: 'middleName',
          type: CustomProfileFieldType.Text,
          label: 'Middle name',
          required: false,
        },
        {
          enabled: true,
          name: 'familyName',
          type: CustomProfileFieldType.Text,
          label: 'Family name',
          required: true,
        },
      ],
    },
  });

/** @deprecated Use `createDefaultCustomProfileFields()` instead. */
export const defaultCustomProfileFields = createDefaultCustomProfileFields(defaultTenantId);
