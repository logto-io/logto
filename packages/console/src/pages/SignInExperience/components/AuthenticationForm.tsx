import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Alert from '@/components/Alert';
import FormField from '@/components/FormField';
import Switch from '@/components/Switch';

import {
  requiredVerifySignInIdentifiers,
  requiredVerifySignUpIdentifiers,
} from '../tabs/SignUpAndSignInTab/constants';
import type { SignInExperienceForm } from '../types';
import * as styles from './index.module.scss';

const AuthenticationForm = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { register, getValues, watch } = useFormContext<SignInExperienceForm>();

  const isForgotPasswordAllowed =
    requiredVerifySignUpIdentifiers.includes(getValues('signUp.identifier')) ||
    getValues('signIn.methods').some(({ identifier }) =>
      requiredVerifySignInIdentifiers.includes(identifier)
    );

  const isForgotPasswordEnabled = watch('forgotPassword');

  return (
    <>
      <div className={styles.title}>{t('sign_in_exp.others.authentication.title')}</div>
      <FormField title="sign_in_exp.others.authentication.enable_user_registration">
        <Switch
          {...register('createAccountEnabled')}
          label={t('sign_in_exp.others.authentication.enable_user_registration_description')}
        />
      </FormField>
      <FormField title="sign_in_exp.others.authentication.enable_forgot_password">
        <Switch
          {...register('forgotPassword')}
          label={t('sign_in_exp.others.authentication.enable_forgot_password_description')}
        />
        {isForgotPasswordEnabled && !isForgotPasswordAllowed && (
          <Alert>
            {t('sign_in_exp.others.authentication.disallow_forgot_password_description')}
          </Alert>
        )}
      </FormField>
    </>
  );
};

export default AuthenticationForm;
