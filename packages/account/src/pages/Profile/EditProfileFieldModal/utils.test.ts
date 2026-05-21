import {
  AccountCenterControlValue,
  CustomProfileFieldType,
  type CustomProfileField,
} from '@logto/schemas';

import type { ProfileFieldRow } from '../types';

import { buildAddressProfileValue, buildEditableFields, type EditableField } from './utils';
import { getValidationError } from './validation';

const translate = (key: string) => key;

const getCustomProfileField = (override: Partial<CustomProfileField> = {}): CustomProfileField => ({
  tenantId: 'default',
  id: 'custom-field-id',
  name: 'customField',
  type: CustomProfileFieldType.Text,
  label: 'Custom field',
  description: null,
  required: false,
  config: {},
  createdAt: 0,
  sieOrder: 0,
  ...override,
});

const getProfileFieldRow = (field: CustomProfileField): ProfileFieldRow => ({
  name: field.name,
  label: field.label,
  controlKey: 'customData',
  controlValue: AccountCenterControlValue.Edit,
  field,
});

describe('EditProfileFieldModal utils', () => {
  it('preserves saved checkbox string values from custom data', () => {
    const field = getCustomProfileField({
      name: 'newsletter',
      type: CustomProfileFieldType.Checkbox,
      config: { defaultValue: 'false' },
    });

    const [editableField] = buildEditableFields(
      getProfileFieldRow(field),
      { customData: { newsletter: 'true' } },
      translate
    );

    expect(editableField?.value).toBe(true);
  });

  it('falls back to false for checkbox fields without config', () => {
    const field = getCustomProfileField({
      name: 'newsletter',
      type: CustomProfileFieldType.Checkbox,
      config: undefined as unknown as CustomProfileField['config'],
    });

    const [editableField] = buildEditableFields(getProfileFieldRow(field), {}, translate);

    expect(editableField?.value).toBe(false);
  });

  it('returns a validation error instead of throwing for invalid regex config', () => {
    const field = {
      name: 'employeeCode',
      label: 'Employee code',
      value: '',
      type: CustomProfileFieldType.Regex,
      required: false,
      config: { format: '[' },
    } satisfies EditableField;

    expect(getValidationError('ABC-12', field, translate)).toBe('error.general_invalid');
  });

  it('recomputes hidden formatted address from editable address parts', () => {
    const fields = [
      {
        name: 'streetAddress',
        label: 'Street address',
        value: 'Old street',
        type: CustomProfileFieldType.Text,
        required: false,
      },
      {
        name: 'country',
        label: 'Country',
        value: 'CA',
        type: CustomProfileFieldType.Text,
        required: false,
      },
    ] satisfies EditableField[];

    expect(
      buildAddressProfileValue({ formatted: 'Old summary', locality: 'Springfield' }, fields, {
        streetAddress: '123 Main St',
        country: 'US',
      })
    ).toEqual({
      formatted: '123 Main St, US',
      locality: 'Springfield',
      streetAddress: '123 Main St',
      country: 'US',
    });
  });

  it('keeps explicitly edited formatted address values', () => {
    const fields = [
      {
        name: 'formatted',
        label: 'Address',
        value: 'Old summary',
        type: CustomProfileFieldType.Text,
        required: false,
      },
      {
        name: 'streetAddress',
        label: 'Street address',
        value: 'Old street',
        type: CustomProfileFieldType.Text,
        required: false,
      },
    ] satisfies EditableField[];

    expect(
      buildAddressProfileValue({ formatted: 'Old summary' }, fields, {
        formatted: 'Manual summary',
        streetAddress: '123 Main St',
      })
    ).toEqual({
      formatted: 'Manual summary',
      streetAddress: '123 Main St',
    });
  });
});
