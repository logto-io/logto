import Button from '@experience/shared/components/Button';
import InputField from '@experience/shared/components/InputFields/InputField';
import { AccountCenterControlValue } from '@logto/schemas';
import { useContext, useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import LoadingContext from '@ac/Providers/LoadingContextProvider/LoadingContext';
import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import { updateProfile } from '@ac/apis/account';
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
  const handleError = useErrorHandler();

  const [name, setName] = useState(userInfo?.name ?? '');
  const [avatar, setAvatar] = useState(userInfo?.avatar ?? '');

  const fields = accountCenterSettings?.fields ?? {};
  const { Off, Edit } = AccountCenterControlValue;

  const nameEnabled = fields.name !== Off;
  const avatarEnabled = fields.avatar !== Off;
  const nameEditable = fields.name === Edit;
  const avatarEditable = fields.avatar === Edit;

  if (!accountCenterSettings?.enabled || (!nameEnabled && !avatarEnabled)) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

  const handleNameChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setName(value);
  };

  const handleAvatarChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setAvatar(value);
  };

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();

    const payload = {
      ...(nameEditable && { name: name.trim() || null }),
      ...(avatarEditable && { avatar: avatar.trim() || null }),
    };

    const [error, updatedProfile] = await updateProfileRequest(payload);

    if (error) {
      await handleError(error, {
        'account_center.field_not_editable': async () => {
          setToast(t('error.something_went_wrong'));
        },
      });
      return;
    }

    if (updatedProfile) {
      setUserInfo((current) => ({
        ...current,
        name: updatedProfile.name ?? current?.name,
        avatar: updatedProfile.avatar ?? current?.avatar,
      }));
    }

    setToast(t('account_center.profile.saved'));
  };

  return (
    <SecondaryPageLayout
      title="account_center.profile.title"
      description="account_center.profile.description"
    >
      <form className={styles.container} onSubmit={handleSubmit}>
        {nameEnabled && (
          <InputField
            label={t('account_center.profile.name_label')}
            name="name"
            value={name}
            isDisabled={!nameEditable}
            onChange={handleNameChange}
          />
        )}

        {avatarEnabled && (
          <InputField
            label={t('account_center.profile.avatar_label')}
            name="avatar"
            type="url"
            value={avatar}
            isDisabled={!avatarEditable}
            onChange={handleAvatarChange}
          />
        )}

        {(nameEditable || avatarEditable) && (
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
