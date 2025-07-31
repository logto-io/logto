import {
  builtInCustomProfileFieldKeys,
  CustomProfileFieldType,
  userProfileAddressKeys,
} from '@logto/schemas';

const addressComponentKeySet = Object.freeze(new Set<string>(userProfileAddressKeys));

export const isBuiltInAddressComponentKey = (
  key?: string
): key is (typeof userProfileAddressKeys)[number] =>
  key !== undefined && addressComponentKeySet.has(key);

const builtInKeySet = Object.freeze(
  new Set<string>([
    ...builtInCustomProfileFieldKeys,
    ...Object.values(userProfileAddressKeys).map((key) => `address.${key}`),
    'fullname',
  ])
);

export const isBuiltInCustomProfileFieldKey = (
  key?: string
): key is (typeof builtInCustomProfileFieldKeys)[number] =>
  key !== undefined && builtInKeySet.has(key);

export const getProfileFieldTypeByName = (name: string): CustomProfileFieldType => {
  switch (name) {
    case 'avatar':
    case 'profile':
    case 'website': {
      return CustomProfileFieldType.Url;
    }
    case 'gender': {
      return CustomProfileFieldType.Select;
    }
    case 'birthdate': {
      return CustomProfileFieldType.Date;
    }
    case 'address': {
      return CustomProfileFieldType.Address;
    }
    case 'fullname': {
      return CustomProfileFieldType.Fullname;
    }
    default: {
      return CustomProfileFieldType.Text;
    }
  }
};
