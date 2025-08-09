import {
  CustomProfileFieldType,
  type TextProfileField,
  type DateProfileField,
  type SelectProfileField,
  type FullnameProfileField,
  type UrlProfileField,
  type AddressProfileField,
  type CheckboxProfileField,
} from '@logto/schemas';

export const nameData = {
  name: `name`,
  type: CustomProfileFieldType.Text,
  label: 'Name',
  required: true,
  config: {
    placeholder: 'John Doe',
    minLength: 5,
    maxLength: 50,
  },
} satisfies TextProfileField;

export const birthDateData = {
  name: `birthDate`,
  type: CustomProfileFieldType.Date,
  label: 'Birth date',
  required: true,
  config: {
    placeholder: '2000-01-01',
    format: 'MM-DD-YYYY',
  },
} satisfies DateProfileField;

export const genderData = {
  name: `gender`,
  type: CustomProfileFieldType.Select,
  label: 'Gender',
  required: true,
  config: {
    placeholder: 'Gender',
    options: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
      { label: 'Other', value: 'other' },
    ],
  },
} satisfies SelectProfileField;

export const websiteData = {
  name: `website`,
  type: CustomProfileFieldType.Url,
  label: 'Website',
  required: true,
  config: {
    placeholder: 'https://www.example.com',
  },
} satisfies UrlProfileField;

export const addressData = {
  name: `address`,
  type: CustomProfileFieldType.Address,
  label: 'Address',
  required: true,
  config: {
    parts: [
      {
        name: 'streetAddress',
        enabled: true,
        type: CustomProfileFieldType.Text,
        label: 'Street address',
        required: true,
      },
      {
        name: 'locality',
        enabled: true,
        type: CustomProfileFieldType.Text,
        label: 'Locality',
        required: true,
      },
      {
        name: 'region',
        enabled: true,
        type: CustomProfileFieldType.Text,
        label: 'Region',
        required: true,
      },
      {
        name: 'postalCode',
        enabled: true,
        type: CustomProfileFieldType.Text,
        label: 'Postal code',
        required: true,
      },
      {
        name: 'country',
        enabled: true,
        type: CustomProfileFieldType.Text,
        label: 'Country',
        required: true,
      },
    ],
  },
} satisfies AddressProfileField;

export const fullnameData = {
  name: `fullname`,
  type: CustomProfileFieldType.Fullname,
  label: 'Full name',
  required: true,
  config: {
    parts: [
      {
        name: 'givenName',
        enabled: true,
        type: CustomProfileFieldType.Text,
        label: 'Given name',
        required: true,
      },
      {
        name: 'familyName',
        enabled: true,
        type: CustomProfileFieldType.Text,
        label: 'Family name',
        required: true,
      },
    ],
  },
} satisfies FullnameProfileField;

export const genericCheckboxData = {
  name: `checkbox`,
  type: CustomProfileFieldType.Checkbox,
  label: "I'm a checkbox",
  required: false,
  config: {
    defaultValue: 'false',
  },
} satisfies CheckboxProfileField;
