import { useTranslation } from 'react-i18next';

import Logo from '@/assets/images/logo.svg';
import AppLoading from '@/components/AppLoading';
import Button from '@/ds-components/Button';
import useCurrentUser from '@/hooks/use-current-user';

import * as styles from './index.module.scss';

type Props = {
  onClickSwitch: () => void;
};

function SwitchAccount({ onClickSwitch }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { user, isLoading } = useCurrentUser();
  const { id, primaryEmail, username } = user ?? {};

  if (isLoading) {
    return <AppLoading />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Logo className={styles.logo} />
        <div className={styles.title}>
          {/** Since this is a Logto Cloud feature, ideally the primary email should always be available.
           * However, in case it's not (e.g. in dev env), we fallback to username and then finally the ID.
           */}
          {t('invitation.email_not_match_title', { email: primaryEmail ?? username ?? id })}
        </div>
        <div className={styles.description}>{t('invitation.email_not_match_description')}</div>
        <Button
          type="primary"
          size="large"
          className={styles.button}
          title="invitation.switch_account"
          onClick={onClickSwitch}
        />
      </div>
    </div>
  );
}

export default SwitchAccount;
