import { AccountCenterControlValue, type CustomProfileField } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { updateAvatar } from '@ac/apis/account';
import AccountPageHeader from '@ac/components/AccountPageHeader';
import AvatarUploadField from '@ac/components/AvatarUploadField';
import PageFooter from '@ac/components/PageFooter';
import { layoutClassNames } from '@ac/constants/layout';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';

import homeStyles from '../Home/index.module.scss';

import EditProfileFieldModal from './EditProfileFieldModal';
import styles from './index.module.scss';
import {
  getAccountCenterProfileFields,
  getProfileFieldControlKey,
  getProfileFieldValue,
} from './profile-field-values';
import type { ProfileFieldRow } from './types';

const profileLabelKeys: Record<string, string> = {
  name: 'profile.name',
  avatar: 'profile.avatar',
  fullname: 'profile.fullname',
  address: 'profile.address.formatted',
};

const Profile = () => {
  const { t } = useTranslation();
  const { accountCenterSettings, experienceSettings, userInfo, refreshUserInfo, setToast } =
    useContext(PageContext);
  const profileFields = getAccountCenterProfileFields(accountCenterSettings);
  const [editingField, setEditingField] = useState<ProfileFieldRow>();

  const fieldRows = useMemo(() => {
    const customProfileFieldCatalog =
      experienceSettings?.customProfileFieldCatalog ??
      experienceSettings?.customProfileFields ??
      [];
    const customProfileFieldMap = new Map(
      customProfileFieldCatalog.map((field: CustomProfileField) => [field.name, field])
    );

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
          value: getProfileFieldValue(userInfo, { name, label }, t, field, styles.avatar),
          controlKey,
          controlValue,
          field,
        },
      ];
    }, []);
  }, [
    accountCenterSettings?.fields,
    experienceSettings?.customProfileFieldCatalog,
    experienceSettings?.customProfileFields,
    profileFields,
    t,
    userInfo,
  ]);

  const updateAvatarRequest = useApi(updateAvatar);
  const handleError = useErrorHandler();

  const handleAvatarChange = useCallback(
    async (avatarUrl: string) => {
      const [error] = await updateAvatarRequest({ avatar: avatarUrl || null });

      if (error) {
        await handleError(error);
        return;
      }

      await refreshUserInfo();
      setToast(t('account_center.update_success.default.description'));
    },
    [handleError, refreshUserInfo, setToast, t, updateAvatarRequest]
  );

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

                  if (name === 'avatar' && controlValue === AccountCenterControlValue.Edit) {
                    return (
                      <AvatarUploadField
                        key={name}
                        value={userInfo?.avatar ?? ''}
                        onChange={handleAvatarChange}
                      />
                    );
                  }

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
