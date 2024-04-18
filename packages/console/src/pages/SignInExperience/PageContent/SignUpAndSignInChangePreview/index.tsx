import type { SignInExperience } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import SignUpAndSignInDiffSection from './SignUpAndSignInDiffSection';
import * as styles from './index.module.scss';

type Props = {
  readonly before: SignInExperience;
  readonly after: SignInExperience;
};

function SignUpAndSignInChangePreview({ before, after }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.container}>
      <div className={styles.description}>{t('sign_in_exp.save_alert.description')}</div>
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
    </div>
  );
}

export default SignUpAndSignInChangePreview;
