import { useTranslation } from 'react-i18next';

import FormField from '@/components/FormField';

import SignInMethodEditBox from './components/SignInMethodEditBox';
import * as styles from './index.module.scss';

const SignInForm = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <>
      <div className={styles.title}>{t('sign_in_exp.sign_up_and_sign_in.sign_in.title')}</div>
      <FormField title="sign_in_exp.sign_up_and_sign_in.sign_in.sign_in_identifier_and_auth">
        <div className={styles.formFieldDescription}>
          {t('sign_in_exp.sign_up_and_sign_in.sign_in.description')}
        </div>
        <SignInMethodEditBox />
      </FormField>
    </>
  );
};

export default SignInForm;
