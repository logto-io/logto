import { CustomProfileFieldType } from '@logto/schemas';

export const primaryEmailData = {
  name: `primaryEmail`,
  type: CustomProfileFieldType.Text,
  label: 'Email address',
  required: true,
  config: {
    placeholder: 'foo@bar.com',
    minLength: 5,
    maxLength: 50,
  },
};

export const birthDateData = {
  name: `birthDate`,
  type: CustomProfileFieldType.Date,
  label: 'Birth date',
  required: true,
  config: {
    placeholder: '2000-01-01',
    format: 'MM-DD-YYYY',
  },
};

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
};

export const websiteData = {
  name: `website`,
  type: CustomProfileFieldType.Url,
  label: 'Website',
  config: {
    placeholder: 'https://www.example.com',
  },
};

export const addressData = {
  name: `address`,
  type: CustomProfileFieldType.Address,
  label: 'Address',
  required: true,
  config: {
    placeholder: '123 Main St',
    parts: [
      { key: 'streetAddress', enabled: true },
      { key: 'locality', enabled: true },
      { key: 'region', enabled: true },
      { key: 'postalCode', enabled: true },
      { key: 'country', enabled: true },
    ],
  },
};

export const fullnameData = {
  name: `fullname`,
  type: CustomProfileFieldType.Fullname,
  label: 'Full name',
  required: true,
  config: {
    placeholder: 'John Doe',
    parts: [
      { key: 'givenName', enabled: true },
      { key: 'familyName', enabled: true },
    ],
  },
};
