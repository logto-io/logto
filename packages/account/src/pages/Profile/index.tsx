import {
  AccountCenterControlValue,
  CustomProfileFieldType,
  fullnameKeys,
  userProfileAddressKeys,
  userProfileKeys,
  type AccountCenter,
  type AccountCenterProfileFields,
  type CustomProfileField,
  type UserProfile,
  type UserProfileResponse,
} from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import AccountPageHeader from '@ac/components/AccountPageHeader';
import PageFooter from '@ac/components/PageFooter';
import { layoutClassNames } from '@ac/constants/layout';

import homeStyles from '../Home/index.module.scss';

import EditProfileFieldModal from './EditProfileFieldModal';
import styles from './index.module.scss';
import { getSelectOptionLabel } from './select-options';
import type { ProfileFieldControlKey, ProfileFieldRow } from './types';

const profileFieldKeySet = new Set<string>(userProfileKeys);
const fullnameKeySet = new Set<string>(fullnameKeys);
const addressKeySet = new Set<string>(userProfileAddressKeys);

const profileLabelKeys: Record<string, string> = {
  name: 'profile.name',
  avatar: 'profile.avatar',
  fullname: 'profile.fullname',
  address: 'profile.address.formatted',
};

const getAccountCenterProfileFields = (settings?: AccountCenter): AccountCenterProfileFields =>
  settings?.profileFields ?? [];

const isCompositeProfileField = (field?: CustomProfileField): boolean =>
  field?.type === CustomProfileFieldType.Fullname || field?.type === CustomProfileFieldType.Address;

const isBuiltInProfileField = (fieldName: string, field?: CustomProfileField): boolean =>
  profileFieldKeySet.has(fieldName) || (fieldName === 'fullname' && field === undefined);

const getProfileFieldControlKey = (
  fieldName: string,
  field?: CustomProfileField
): ProfileFieldControlKey => {
  if (fieldName === 'name' || fieldName === 'avatar') {
    return fieldName;
  }

  if (isBuiltInProfileField(fieldName, field) || isCompositeProfileField(field)) {
    return 'profile';
  }

  return 'customData';
};

const joinValues = (values: Array<string | undefined>, separator = ' '): string | undefined => {
  const value = values.filter(Boolean).join(separator);

  return value || undefined;
};

const getPrimitiveValue = (value: unknown): string | undefined => {
  if (value === undefined || value === null || value === '') {
    return;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
};

const getFullnameValue = (profile?: UserProfile): string | undefined =>
  joinValues(fullnameKeys.map((name) => profile?.[name]));

const getAddressValue = (address?: UserProfile['address']): string | undefined =>
  joinValues(
    userProfileAddressKeys.map((name) => address?.[name]),
    ', '
  );

const isFullnameKey = (name: string): name is (typeof fullnameKeys)[number] =>
  fullnameKeySet.has(name);

const isAddressKey = (name: string): name is (typeof userProfileAddressKeys)[number] =>
  addressKeySet.has(name);

const getBuiltInProfileFieldValue = (
  profile: UserProfile | undefined,
  fieldName: string
): string | undefined => {
  switch (fieldName) {
    case 'fullname': {
      return getFullnameValue(profile);
    }
    case 'familyName': {
      return getPrimitiveValue(profile?.familyName);
    }
    case 'givenName': {
      return getPrimitiveValue(profile?.givenName);
    }
    case 'middleName': {
      return getPrimitiveValue(profile?.middleName);
    }
    case 'nickname': {
      return getPrimitiveValue(profile?.nickname);
    }
    case 'preferredUsername': {
      return getPrimitiveValue(profile?.preferredUsername);
    }
    case 'profile': {
      return getPrimitiveValue(profile?.profile);
    }
    case 'website': {
      return getPrimitiveValue(profile?.website);
    }
    case 'gender': {
      return getPrimitiveValue(profile?.gender);
    }
    case 'birthdate': {
      return getPrimitiveValue(profile?.birthdate);
    }
    case 'zoneinfo': {
      return getPrimitiveValue(profile?.zoneinfo);
    }
    case 'locale': {
      return getPrimitiveValue(profile?.locale);
    }
    case 'address': {
      return getAddressValue(profile?.address);
    }
    default: {
      return undefined;
    }
  }
};

const getCompositeFieldValue = (
  userInfo: Partial<UserProfileResponse> | undefined,
  field: CustomProfileField
): string | undefined => {
  const { profile } = userInfo ?? {};

  if (field.type === CustomProfileFieldType.Fullname) {
    const partNames =
      field.config.parts === undefined
        ? fullnameKeys
        : field.config.parts.filter(({ enabled }) => enabled).map(({ name }) => name);

    return joinValues(
      partNames
        .filter((name): name is (typeof fullnameKeys)[number] => isFullnameKey(name))
        .map((name) => profile?.[name])
    );
  }

  if (field.type === CustomProfileFieldType.Address) {
    const address = profile?.address;
    const partNames =
      field.config.parts === undefined
        ? userProfileAddressKeys
        : field.config.parts.filter(({ enabled }) => enabled).map(({ name }) => name);

    return joinValues(
      partNames
        .filter((name): name is (typeof userProfileAddressKeys)[number] => isAddressKey(name))
        .map((name) => address?.[name]),
      ', '
    );
  }
};

const getProfileFieldValue = (
  userInfo: Partial<UserProfileResponse> | undefined,
  { name: fieldName, label: fieldLabel }: { readonly name: string; readonly label: string },
  translate: (key: string) => string,
  field?: CustomProfileField
): React.ReactNode | undefined => {
  if (fieldName === 'avatar') {
    return userInfo?.avatar ? (
      <img
        className={styles.avatar}
        src={userInfo.avatar}
        alt={getPrimitiveValue(userInfo.name) ?? fieldLabel}
      />
    ) : undefined;
  }

  if (fieldName === 'name') {
    return getPrimitiveValue(userInfo?.name);
  }

  if (
    field?.type === CustomProfileFieldType.Fullname ||
    field?.type === CustomProfileFieldType.Address
  ) {
    return getCompositeFieldValue(userInfo, field);
  }

  if (field?.type === CustomProfileFieldType.Select) {
    const value = isBuiltInProfileField(fieldName, field)
      ? getBuiltInProfileFieldValue(userInfo?.profile, fieldName)
      : getPrimitiveValue(userInfo?.customData?.[fieldName]);

    const option = field.config.options?.find((option) => option.value === value);

    return value === undefined ? undefined : getSelectOptionLabel(value, option?.label, translate);
  }

  if (isBuiltInProfileField(fieldName, field)) {
    const value = getBuiltInProfileFieldValue(userInfo?.profile, fieldName);

    return fieldName === 'gender' && value
      ? getSelectOptionLabel(value, undefined, translate)
      : value;
  }

  return getPrimitiveValue(userInfo?.customData?.[fieldName]);
};

const Profile = () => {
  const { t } = useTranslation();
  const { accountCenterSettings, experienceSettings, userInfo, refreshUserInfo, setToast } =
    useContext(PageContext);
  const profileFields = getAccountCenterProfileFields(accountCenterSettings);
  const [editingField, setEditingField] = useState<ProfileFieldRow>();

  const fieldRows = useMemo(() => {
    const customProfileFields = experienceSettings?.customProfileFields ?? [];
    const customProfileFieldMap = new Map(customProfileFields.map((field) => [field.name, field]));

    return profileFields.reduce<ProfileFieldRow[]>((rows, { name }) => {
      const field = customProfileFieldMap.get(name);
      const controlKey = getProfileFieldControlKey(name, field);

      const controlValue = accountCenterSettings?.fields[controlKey];

      if (!controlValue || controlValue === AccountCenterControlValue.Off) {
        return rows;
      }

      const labelKey = profileLabelKeys[name] ?? `profile.${name}`;
      const label =
        field?.label === undefined || field.label === ''
          ? t(labelKey, { defaultValue: name })
          : field.label;

      return [
        ...rows,
        {
          name,
          label,
          value: getProfileFieldValue(userInfo, { name, label }, t, field),
          controlKey,
          controlValue,
          field,
        },
      ];
    }, []);
  }, [
    accountCenterSettings?.fields,
    experienceSettings?.customProfileFields,
    profileFields,
    t,
    userInfo,
  ]);

  const handleUpdated = useCallback(async () => {
    await refreshUserInfo();
    setToast(t('account_center.update_success.default.description'));
  }, [refreshUserInfo, setToast, t]);

  return (
    <>
      <div className={homeStyles.container}>
        <AccountPageHeader
          titleKey="account_center.page.profile_title"
          descriptionKey="account_center.page.profile_description"
        />
        <div className={classNames(homeStyles.content, layoutClassNames.pageContent)}>
          {fieldRows.length > 0 && (
            <div className={classNames(styles.section, layoutClassNames.section)}>
              <div className={classNames(styles.card, layoutClassNames.card)}>
                {fieldRows.map((fieldRow) => {
                  const { name, label, value, controlValue } = fieldRow;

                  return (
                    <div key={name} className={classNames(styles.row, layoutClassNames.row)}>
                      <div className={styles.topLine}>
                        <div className={styles.name}>{label}</div>
                        {name !== 'avatar' && controlValue === AccountCenterControlValue.Edit && (
                          <div className={styles.actions}>
                            <button
                              type="button"
                              className={styles.changeButton}
                              onClick={() => {
                                setEditingField(fieldRow);
                              }}
                            >
                              {t('account_center.security.change')}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className={classNames(styles.value, !value && styles.secondaryValue)}>
                        {value ?? t('account_center.security.not_set')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <PageFooter />
      </div>
      <EditProfileFieldModal
        field={editingField}
        userInfo={userInfo}
        onUpdated={handleUpdated}
        onClose={() => {
          setEditingField(undefined);
        }}
      />
    </>
  );
};

export default Profile;
