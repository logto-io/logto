import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/components/FormField';

import type { SignInExperienceForm } from '../../types';
import SignInMethodEditBox from './components/SignInMethodEditBox';
import { signUpToSignInIdentifierMapping } from './constants';
import * as styles from './index.module.scss';

const SignInForm = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { control, watch } = useFormContext<SignInExperienceForm>();
  const signUpIdentifier = watch('signUp.identifier');
  const requirePassword = watch('signUp.password');
  const requireVerificationCode = watch('signUp.verify');

  return (
    <>
      <div className={styles.title}>{t('sign_in_exp.sign_up_and_sign_in.sign_in.title')}</div>
      <FormField title="sign_in_exp.sign_up_and_sign_in.sign_in.sign_in_identifier_and_auth">
        <div className={styles.formFieldDescription}>
          {t('sign_in_exp.sign_up_and_sign_in.sign_in.description')}
        </div>
        <Controller
          control={control}
          name="signIn.methods"
          render={({ field: { value, onChange } }) => {
            return (
              <SignInMethodEditBox
                value={value}
                requiredSignInIdentifiers={signUpToSignInIdentifierMapping[signUpIdentifier]}
                isPasswordRequired={requirePassword}
                isVerificationRequired={requireVerificationCode}
                onChange={onChange}
              />
            );
          }}
        />
      </FormField>
    </>
  );
};

export default SignInForm;
