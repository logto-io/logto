import {
  builtInCustomProfileFieldKeys,
  CustomProfileFieldType,
  type FieldPart,
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

/**
 * Generates field tags based on the field name and its composition parts.
 * For address fields, it prefixes the field name with 'address.'.
 * For custom fields, it prefixes with 'customData.'.
 * Other built-in fields are used as-is.
 */
export const getFieldTags = (fieldName: string, compositionParts?: FieldPart[]): string[] => {
  if (compositionParts) {
    return compositionParts
      .filter(({ enabled }) => enabled)
      .map(({ name }) => (fieldName === 'address' ? `address.${name}` : name));
  }

  return isBuiltInCustomProfileFieldKey(fieldName) ? [fieldName] : [`customData.${fieldName}`];
};
