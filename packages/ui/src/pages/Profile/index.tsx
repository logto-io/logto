import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { getUserProfile } from '@/apis/profile';
import LoadingLayer from '@/components/LoadingLayer';
import useApi from '@/hooks/use-api';

import FormCard from './components/FormCard';
import Table from './components/Table';
import * as styles from './index.module.scss';

const Profile = () => {
  const { t } = useTranslation();
  const { run: asyncGetProfile, result: profile } = useApi(getUserProfile);

  useEffect(() => {
    void asyncGetProfile();
  }, [asyncGetProfile]);

  if (!profile) {
    return <LoadingLayer />;
  }

  const { avatar, name, username, primaryEmail, primaryPhone } = profile;

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.title}>{t('profile.title')}</div>
          <div className={styles.subtitle}>{t('profile.description')}</div>
        </div>
        <FormCard title="profile.settings.title">
          <Table
            title="profile.settings.profile_information"
            data={[
              { label: 'profile.settings.avatar', value: avatar },
              { label: 'profile.settings.name', value: name },
              { label: 'profile.settings.username', value: username },
            ]}
          />
        </FormCard>
        <FormCard title="profile.password.title">
          <Table
            title="profile.password.reset_password"
            data={[{ label: 'profile.password.reset_password', value: '******' }]}
          />
        </FormCard>
        <FormCard title="profile.link_account.title">
          <Table
            title="profile.link_account.email_phone_sign_in"
            data={[
              { label: 'profile.link_account.email', value: primaryEmail },
              { label: 'profile.link_account.phone', value: primaryPhone },
            ]}
          />
        </FormCard>
      </div>
    </div>
  );
};

export default Profile;
