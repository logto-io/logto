import Button from '@experience/shared/components/Button';
import InputField from '@experience/shared/components/InputFields/InputField';
import { AccountCenterControlValue } from '@logto/schemas';
import { useContext, useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import LoadingContext from '@ac/Providers/LoadingContextProvider/LoadingContext';
import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { updateProfile, updateProfileFields } from '@ac/apis/account';
import ErrorPage from '@ac/components/ErrorPage';
import useApi from '@ac/hooks/use-api';
import useErrorHandler from '@ac/hooks/use-error-handler';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';

import styles from './index.module.scss';

const Profile = () => {
  const { t } = useTranslation();
  const { loading } = useContext(LoadingContext);
  const { accountCenterSettings, userInfo, setUserInfo, setToast } = useContext(PageContext);
  const updateProfileRequest = useApi(updateProfile);
  const updateProfileFieldsRequest = useApi(updateProfileFields);
  const handleError = useErrorHandler();

  const [name, setName] = useState(userInfo?.name ?? '');
  const [avatar, setAvatar] = useState(userInfo?.avatar ?? '');
  const [givenName, setGivenName] = useState(userInfo?.profile?.givenName ?? '');
  const [familyName, setFamilyName] = useState(userInfo?.profile?.familyName ?? '');

  const fields = accountCenterSettings?.fields ?? {};
  const { Off, Edit } = AccountCenterControlValue;

  const nameEnabled = fields.name !== Off;
  const avatarEnabled = fields.avatar !== Off;
  const profileEnabled = fields.profile !== Off;
  const nameEditable = fields.name === Edit;
  const avatarEditable = fields.avatar === Edit;
  const profileEditable = fields.profile === Edit;

  if (!accountCenterSettings?.enabled || (!nameEnabled && !avatarEnabled && !profileEnabled)) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();

    const mainPayload = {
      ...(nameEditable && { name: name.trim() || null }),
      ...(avatarEditable && { avatar: avatar.trim() || null }),
    };

    const profilePayload = {
      ...(profileEditable && { givenName: givenName.trim() || undefined }),
      ...(profileEditable && { familyName: familyName.trim() || undefined }),
    };

    const hasMainChanges = nameEditable || avatarEditable;
    const hasProfileChanges = profileEditable;

    const [mainError, updatedProfile] = hasMainChanges
      ? await updateProfileRequest(mainPayload)
      : [undefined, undefined];

    if (mainError) {
      await handleError(mainError, {
        'account_center.field_not_editable': async () => {
          setToast(t('error.something_went_wrong'));
        },
      });
      return;
    }

    const [profileError, updatedProfileFields] = hasProfileChanges
      ? await updateProfileFieldsRequest(profilePayload)
      : [undefined, undefined];

    if (profileError) {
      await handleError(profileError, {
        'account_center.field_not_editable': async () => {
          setToast(t('error.something_went_wrong'));
        },
      });
      return;
    }

    setUserInfo((current) => ({
      ...current,
      ...(updatedProfile && {
        name: updatedProfile.name ?? current?.name,
        avatar: updatedProfile.avatar ?? current?.avatar,
      }),
      ...(updatedProfileFields && {
        profile: {
          ...current?.profile,
          givenName: updatedProfileFields.givenName,
          familyName: updatedProfileFields.familyName,
        },
      }),
    }));

    setToast(t('account_center.profile.saved'));
  };

  const isAnyEditable = nameEditable || avatarEditable || profileEditable;

  return (
    <SecondaryPageLayout
      title="account_center.profile.title"
      description="account_center.profile.description"
    >
      <form className={styles.container} onSubmit={handleSubmit}>
        {profileEnabled && (
          <InputField
            label={t('account_center.profile.given_name_label')}
            name="givenName"
            value={givenName}
            isDisabled={!profileEditable}
            onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
              setGivenName(value);
            }}
          />
        )}

        {profileEnabled && (
          <InputField
            label={t('account_center.profile.family_name_label')}
            name="familyName"
            value={familyName}
            isDisabled={!profileEditable}
            onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
              setFamilyName(value);
            }}
          />
        )}

        {nameEnabled && (
          <InputField
            label={t('account_center.profile.name_label')}
            name="name"
            value={name}
            isDisabled={!nameEditable}
            onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
              setName(value);
            }}
          />
        )}

        {avatarEnabled && (
          <InputField
            label={t('account_center.profile.avatar_label')}
            name="avatar"
            type="url"
            value={avatar}
            isDisabled={!avatarEditable}
            onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
              setAvatar(value);
            }}
          />
        )}

        {isAnyEditable && (
          <Button
            className={styles.submit}
            title="action.save"
            htmlType="submit"
            isLoading={loading}
          />
        )}
      </form>
    </SecondaryPageLayout>
  );
};

export default Profile;
