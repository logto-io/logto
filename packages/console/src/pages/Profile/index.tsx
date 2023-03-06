import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import useLogtoAdminUser from '@/hooks/use-logto-admin-user';
import * as resourcesStyles from '@/scss/resources.module.scss';

import BasicUserInfoSection from './components/BasicUserInfoSection';
import CardContent from './components/CardContent';
import LinkAccountSection from './components/LinkAccountSection';
import NotSet from './components/NotSet';
import Section from './components/Section';
import DeleteAccountModal from './containers/DeleteAccountModal';
import * as styles from './index.module.scss';

const Profile = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();
  const [user, mutate] = useLogtoAdminUser();
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  if (!user) {
    return null;
  }

  const { primaryEmail, passwordEncrypted } = user;

  return (
    <div className={resourcesStyles.container}>
      <div className={resourcesStyles.headline}>
        <CardTitle title="profile.title" subtitle="profile.description" />
      </div>
      <div className={styles.content}>
        <BasicUserInfoSection user={user} onUpdate={mutate} />
        <LinkAccountSection user={user} onUpdate={mutate} />
        <Section title="profile.password.title">
          <CardContent
            title="profile.password.password_setting"
            data={[
              {
                key: 'password',
                label: 'profile.password.password',
                value: passwordEncrypted,
                renderer: (value) => (value ? <span>********</span> : <NotSet />),
                action: {
                  name: 'profile.change',
                  handler: () => {
                    navigate('verify-password', {
                      state: { email: primaryEmail, action: 'changePassword' },
                    });
                  },
                },
              },
            ]}
          />
        </Section>
        <Section title="profile.delete_account.title">
          <div className={styles.deleteAccount}>
            <div className={styles.description}>{t('profile.delete_account.description')}</div>
            <Button
              title="profile.delete_account.button"
              onClick={() => {
                setShowDeleteAccountModal(true);
              }}
            />
          </div>
          <DeleteAccountModal
            isOpen={showDeleteAccountModal}
            onClose={() => {
              setShowDeleteAccountModal(false);
            }}
          />
        </Section>
      </div>
    </div>
  );
};

export default Profile;
