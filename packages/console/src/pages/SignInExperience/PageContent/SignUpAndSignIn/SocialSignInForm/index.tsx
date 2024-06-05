import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Card from '@/ds-components/Card';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';

import type { SignInExperienceForm } from '../../../types';
import FormFieldDescription from '../../components/FormFieldDescription';
import FormSectionTitle from '../../components/FormSectionTitle';

import SocialConnectorEditBox from './SocialConnectorEditBox';

function SocialSignInForm() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { control, watch, register } = useFormContext<SignInExperienceForm>();
  const socialConnectorCount = watch('socialSignInConnectorTargets').length || 0;

  return (
    <Card>
      <FormSectionTitle title="sign_up_and_sign_in.social_sign_in.title" />
      <FormField title="sign_in_exp.sign_up_and_sign_in.social_sign_in.social_sign_in">
        <FormFieldDescription>
          {t('sign_in_exp.sign_up_and_sign_in.social_sign_in.description')}
        </FormFieldDescription>
        <Controller
          control={control}
          defaultValue={[]}
          name="socialSignInConnectorTargets"
          render={({ field: { value, onChange } }) => {
            return <SocialConnectorEditBox value={value} onChange={onChange} />;
          }}
        />
      </FormField>
      {socialConnectorCount > 0 && (
        <FormField title="sign_in_exp.sign_up_and_sign_in.social_sign_in.automatic_account_linking">
          <Switch
            {...register('socialSignIn.automaticAccountLinking')}
            label={t(
              'sign_in_exp.sign_up_and_sign_in.social_sign_in.automatic_account_linking_label'
            )}
          />
        </FormField>
      )}
    </Card>
  );
}

export default SocialSignInForm;
