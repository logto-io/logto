import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/components/FormField';
import Switch from '@/components/Switch';

import type { SignInExperienceForm } from '../../types';
import * as styles from '../index.module.scss';

const AuthenticationForm = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { register } = useFormContext<SignInExperienceForm>();

  return (
    <>
      <div className={styles.title}>{t('sign_in_exp.others.advanced_options.title')}</div>
      <FormField title="sign_in_exp.others.advanced_options.enable_user_registration">
        <Switch
          {...register('createAccountEnabled')}
          label={t('sign_in_exp.others.advanced_options.enable_user_registration_description')}
        />
      </FormField>
    </>
  );
};

export default AuthenticationForm;
