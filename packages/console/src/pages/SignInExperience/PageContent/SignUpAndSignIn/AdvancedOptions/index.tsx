import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Card from '@/ds-components/Card';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import TextLink from '@/ds-components/TextLink';

import type { SignInExperienceForm } from '../../../types';
import FormSectionTitle from '../../components/FormSectionTitle';

import styles from './index.module.scss';

function AdvancedOptions() {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.sign_in_exp.sign_up_and_sign_in.advanced_options',
  });
  const { register } = useFormContext<SignInExperienceForm>();

  return (
    <Card>
      <FormSectionTitle title="sign_up_and_sign_in.advanced_options.title" />
      <FormField title="sign_in_exp.sign_up_and_sign_in.advanced_options.enable_single_sign_on">
        <Switch
          {...register('singleSignOnEnabled')}
          label={t('enable_single_sign_on_description')}
        />
      </FormField>
      <div className={styles.setUpHint}>
        {t('single_sign_on_hint.prefix')}
        <TextLink to="/enterprise-sso" className={styles.setup}>
          {t('single_sign_on_hint.link')}
        </TextLink>
        {t('single_sign_on_hint.suffix')}
      </div>
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
