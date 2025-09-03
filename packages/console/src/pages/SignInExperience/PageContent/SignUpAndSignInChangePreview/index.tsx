import { Trans, useTranslation } from 'react-i18next';

import InlineNotification from '@/ds-components/InlineNotification';

import { type SignInExperiencePageManagedData } from '../../types';

import PasswordDisabledNotification from './PasswordDisabledNotification';
import SignUpAndSignInDiffSection from './SignUpAndSignInDiffSection';
import styles from './index.module.scss';

type Props = {
  readonly before: SignInExperiencePageManagedData;
  readonly after: SignInExperiencePageManagedData;
  readonly isForgotPasswordMigrationNoticeVisible: boolean;
};

function SignUpAndSignInChangePreview({
  before,
  after,
  isForgotPasswordMigrationNoticeVisible,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.container}>
      <div className={styles.description}>
        {isForgotPasswordMigrationNoticeVisible && (
          <InlineNotification severity="alert" className={styles.notification}>
            <Trans
              i18nKey="admin_console.sign_in_exp.save_alert.forgot_password_migration_notice"
              components={{ strong: <strong /> }}
            />
          </InlineNotification>
        )}
        {t('sign_in_exp.save_alert.description')}
      </div>
      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.title}>{t('sign_in_exp.save_alert.before')}</div>
          <SignUpAndSignInDiffSection before={before} after={after} />
        </div>
        <div className={styles.section}>
          <div className={styles.title}>{t('sign_in_exp.save_alert.after')}</div>
          <SignUpAndSignInDiffSection isAfter before={before} after={after} />
        </div>
      </div>
      <PasswordDisabledNotification after={after} className={styles.notification} />
    </div>
  );
}

export default SignUpAndSignInChangePreview;
