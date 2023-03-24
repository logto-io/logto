import { useTranslation } from 'react-i18next';

import Card from '@/components/Card';
import FormField from '@/components/FormField';

import * as styles from '../index.module.scss';

import SignInMethodEditBox from './components/SignInMethodEditBox';

function SignInForm() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <Card>
      <div className={styles.title}>{t('sign_in_exp.sign_up_and_sign_in.sign_in.title')}</div>
      <FormField title="sign_in_exp.sign_up_and_sign_in.sign_in.sign_in_identifier_and_auth">
        <div className={styles.formFieldDescription}>
          {t('sign_in_exp.sign_up_and_sign_in.sign_in.description')}
        </div>
        <SignInMethodEditBox />
      </FormField>
    </Card>
  );
}

export default SignInForm;
