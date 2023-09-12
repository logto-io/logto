import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Card from '@/ds-components/Card';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';

import type { SignInExperienceForm } from '../../types';
import * as styles from '../index.module.scss';

function AdvancedOptions() {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.sign_in_exp.sign_up_and_sign_in.advanced_options',
  });
  const { register } = useFormContext<SignInExperienceForm>();

  return (
    <Card>
      <div className={styles.title}>{t('title')}</div>
      <FormField title="sign_in_exp.sign_up_and_sign_in.advanced_options.enable_user_registration">
        <Switch
          {...register('createAccountEnabled')}
          label={t('enable_user_registration_description')}
        />
      </FormField>
    </Card>
  );
}

export default AdvancedOptions;
