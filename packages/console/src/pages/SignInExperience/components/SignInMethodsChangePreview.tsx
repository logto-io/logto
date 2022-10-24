import type { SignInExperience } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import * as styles from './SignInMethodsChangePreview.module.scss';
import SignInMethodsPreview from './SignInMethodsPreview';

type Props = {
  before: SignInExperience;
  after: SignInExperience;
};

const SignInMethodsChangePreview = ({ before, after }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div>
      <div className={styles.description}>{t('sign_in_exp.save_alert.description')}</div>
      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.title}>{t('sign_in_exp.save_alert.before')}</div>
          <SignInMethodsPreview data={before} />
        </div>
        <div className={styles.section}>
          <div className={styles.title}>{t('sign_in_exp.save_alert.after')}</div>
          <SignInMethodsPreview data={after} />
        </div>
      </div>
    </div>
  );
};

export default SignInMethodsChangePreview;
