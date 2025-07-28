import { CustomProfileFieldType, type CustomProfileField } from '@logto/schemas';

export const mockCustomProfileFields: CustomProfileField[] = [
  {
    tenantId: 'fake_tenant',
    id: 'fake-id-1',
    name: 'fullname',
    type: CustomProfileFieldType.Fullname,
    label: 'Full name',
    description: 'Your fullname (Given name, middle name, and family name)',
    required: false,
    config: {
      parts: [
        {
          name: 'givenName',
          type: CustomProfileFieldType.Text,
          label: 'Given name',
          required: true,
          enabled: true,
        },
        {
          name: 'middleName',
          type: CustomProfileFieldType.Text,
          label: 'Middle name',
          required: true,
          enabled: false,
        },
        {
          name: 'familyName',
          type: CustomProfileFieldType.Text,
          label: 'Family name',
          required: true,
          enabled: true,
        },
      ],
    },
    createdAt: 1_751_275_036_222,
    sieOrder: 1,
  },
  {
    tenantId: 'fake_tenant',
    id: 'fake-id-2',
    name: 'gender',
    type: CustomProfileFieldType.Select,
    label: 'Gender',
    description: null,
    required: false,
    config: {
      options: [
        {
          label: 'Male',
          value: 'male',
        },
        {
          label: 'Female',
          value: 'female',
        },
        {
          label: 'Rather not tell',
          value: 'doNotTell',
        },
      ],
    },
    createdAt: 1_751_275_162_369,
    sieOrder: 2,
  },
];
