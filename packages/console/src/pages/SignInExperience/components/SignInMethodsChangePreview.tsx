import type { SignInExperience } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import SignUpAndSignInDiffSection from '../tabs/SignUpAndSignInTab/components/SignUpAndSignInDiffSection';
import {
  diffSignInMethods,
  diffSignUp,
  diffSocialTargets,
} from '../tabs/SignUpAndSignInTab/components/SignUpAndSignInDiffSection/utilities';
import * as styles from './SignInMethodsChangePreview.module.scss';

type Props = {
  before: SignInExperience;
  after: SignInExperience;
};

const SignInMethodsChangePreview = ({ before, after }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const signUpDiff = diffSignUp(before.signUp, after.signUp);
  const signInMethodsDiff = diffSignInMethods(before.signIn.methods, after.signIn.methods);
  const socialTargetsDiff = diffSocialTargets(
    before.socialSignInConnectorTargets,
    after.socialSignInConnectorTargets
  );

  return (
    <div>
      <div className={styles.description}>{t('sign_in_exp.save_alert.description')}</div>
      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.title}>{t('sign_in_exp.save_alert.before')}</div>
          <SignUpAndSignInDiffSection
            signUpDiff={signUpDiff}
            signInMethodsDiff={signInMethodsDiff}
            socialTargetsDiff={socialTargetsDiff}
          />
        </div>
        <div className={styles.section}>
          <div className={styles.title}>{t('sign_in_exp.save_alert.after')}</div>
          <SignUpAndSignInDiffSection
            isAfter
            signUpDiff={signUpDiff}
            signInMethodsDiff={signInMethodsDiff}
            socialTargetsDiff={socialTargetsDiff}
          />
        </div>
      </div>
    </div>
  );
};

export default SignInMethodsChangePreview;
