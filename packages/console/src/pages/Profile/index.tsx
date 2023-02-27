import type { IdTokenClaims } from '@logto/react';
import { useLogto } from '@logto/react';
import type { Nullable } from '@silverhand/essentials';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import UserAvatar from '@/components/UserAvatar';
import { isCloud } from '@/consts/cloud';
import * as resourcesStyles from '@/scss/resources.module.scss';

import type { Row } from './components/CardContent';
import CardContent from './components/CardContent';
import Section from './components/Section';
import * as styles from './index.module.scss';

const Profile = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getIdTokenClaims } = useLogto();
  const [user, setUser] = useState<IdTokenClaims>();

  useEffect(() => {
    (async () => {
      const claims = await getIdTokenClaims();

      if (claims) {
        setUser(claims);
      }
    })();
  }, [getIdTokenClaims]);

  if (!user) {
    return null;
  }

  const { name, username, picture, email } = user;

  const conditionalUsername: Array<Row<Nullable<string> | undefined>> = isCloud
    ? [{ label: 'profile.settings.username', value: username }]
    : [];

  return (
    <div className={resourcesStyles.container}>
      <div className={resourcesStyles.headline}>
        <CardTitle title="profile.title" subtitle="profile.description" />
      </div>
      <Section title="profile.settings.title">
        <CardContent
          title="profile.settings.profile_information"
          data={[
            {
              label: 'profile.settings.avatar',
              value: picture,
              renderer: (value) => <UserAvatar className={styles.avatar} url={value} />,
            },
            { label: 'profile.settings.name', value: name },
            ...conditionalUsername,
          ]}
        />
      </Section>
      {isCloud && (
        <Section title="profile.link_account.title">
          <CardContent
            title="profile.link_account.email_sign_in"
            data={[{ label: 'profile.link_account.email', value: email }]}
          />
        </Section>
      )}
      <Section title="profile.password.title">
        <CardContent
          title="profile.password.reset_password"
          data={[{ label: 'profile.password.password', value: '******' }]}
        />
      </Section>
      {isCloud && (
        <Section title="profile.delete_account.title">
          <div className={styles.deleteAccount}>
            <div className={styles.description}>{t('profile.delete_account.description')}</div>
            <Button
              title="profile.delete_account.button"
              onClick={() => {
                console.log('Not implemented.');
              }}
            />
          </div>
        </Section>
      )}
    </div>
  );
};

export default Profile;
