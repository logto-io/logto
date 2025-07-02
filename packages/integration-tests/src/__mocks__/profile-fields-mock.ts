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
      { key: 'streetAddress', enabled: true },
      { key: 'locality', enabled: true },
      { key: 'region', enabled: true },
      { key: 'postalCode', enabled: true },
      { key: 'country', enabled: true },
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
      { key: 'givenName', enabled: true },
      { key: 'familyName', enabled: true },
    ],
  },
} satisfies FullnameProfileField;

export const genericCheckboxData = {
  name: `checkbox`,
  type: CustomProfileFieldType.Checkbox,
  label: "I'm a checkbox",
  required: true,
  config: {
    options: [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
    ],
  },
} satisfies CheckboxProfileField;
