import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/components/FormField';
import Switch from '@/components/Switch';

import { SignInExperienceForm } from '../types';
import * as styles from './index.module.scss';

const AuthenticationForm = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { register } = useFormContext<SignInExperienceForm>();

  return (
    <>
      <div className={styles.title}>{t('sign_in_exp.others.authentication.title')}</div>
      <FormField title="sign_in_exp.others.authentication.enable_create_account">
        <Switch
          {...register('createAccountEnabled')}
          label={t('sign_in_exp.others.authentication.enable_create_account_description')}
        />
      </FormField>
    </>
  );
};

export default AuthenticationForm;
