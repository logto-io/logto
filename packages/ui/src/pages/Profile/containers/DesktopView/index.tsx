import type { UserProfileResponse } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import FormCard from '../../components/FormCard';
import Table from '../../components/Table';

type Props = {
  profile: UserProfileResponse;
};

const DesktopView = ({ profile }: Props) => {
  const { t } = useTranslation();
  const { avatar, name, username, primaryEmail, primaryPhone, hasPasswordSet } = profile;

  return (
    <>
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
          data={[
            {
              label: 'profile.password.reset_password',
              value: hasPasswordSet ? '******' : t('profile.not_set'),
            },
          ]}
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
    </>
  );
};

export default DesktopView;
