import type { UserProfileResponse } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import NavItem from '../../components/NavItem';

type Props = {
  profile: UserProfileResponse;
};

const MobileView = ({ profile }: Props) => {
  const { t } = useTranslation();

  const { username, primaryEmail, primaryPhone, hasPasswordSet, identities } = profile;
  const socialConnectorNames = identities?.length
    ? Object.keys(identities).join(', ')
    : t('profile.not_set');

  return (
    <>
      <NavItem
        data={[
          {
            label: 'profile.settings.username',
            value: username ?? t('profile.not_set'),
            onTap: () => {
              console.log('username');
            },
          },
        ]}
      />
      <NavItem
        data={[
          {
            label: 'profile.password.reset_password_sc',
            value: hasPasswordSet ? '******' : t('profile.not_set'),
            onTap: () => {
              console.log('password');
            },
          },
        ]}
      />
      <NavItem
        data={[
          {
            label: 'profile.link_account.email',
            value: primaryEmail ?? t('profile.not_set'),
            onTap: () => {
              console.log('email');
            },
          },
          {
            label: 'profile.link_account.phone_sc',
            value: primaryPhone ?? t('profile.not_set'),
            onTap: () => {
              console.log('phone');
            },
          },
          {
            label: 'profile.link_account.social_sc',
            value: socialConnectorNames,
            onTap: () => {
              console.log('social accounts');
            },
          },
        ]}
      />
    </>
  );
};

export default MobileView;
