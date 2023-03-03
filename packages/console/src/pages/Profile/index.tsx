import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import { isCloud } from '@/consts/cloud';
import useLogtoUserInfo from '@/hooks/use-logto-userinfo';
import * as resourcesStyles from '@/scss/resources.module.scss';

import BasicUserInfoSection from './components/BasicUserInfoSection';
import CardContent from './components/CardContent';
import Section from './components/Section';
import DeleteAccountModal from './containers/DeleteAccountModal';
import * as styles from './index.module.scss';

const Profile = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();
  const [user, fetchUser] = useLogtoUserInfo();
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <div className={resourcesStyles.container}>
      <div className={resourcesStyles.headline}>
        <CardTitle title="profile.title" subtitle="profile.description" />
      </div>
      <BasicUserInfoSection user={user} onUpdate={fetchUser} />
      {isCloud && (
        <Section title="profile.link_account.title">
          <CardContent
            title="profile.link_account.email_sign_in"
            data={[
              {
                label: 'profile.link_account.email',
                value: user.email,
                actionName: 'profile.change',
                action: () => {
                  navigate('link-email', { state: { email: user.email, action: 'changeEmail' } });
                },
              },
            ]}
          />
        </Section>
      )}
      <Section title="profile.password.title">
        <CardContent
          title="profile.password.password_setting"
          data={[
            {
              label: 'profile.password.password',
              value: '******',
              actionName: 'profile.change',
              action: () => {
                navigate('verify-password', {
                  state: { email: user.email, action: 'changePassword' },
                });
              },
            },
          ]}
        />
      </Section>
      {isCloud && (
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
      )}
    </div>
  );
};

export default Profile;
