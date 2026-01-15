import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { isDevFeaturesEnabled } from '@/consts/env';
import Card from '@/ds-components/Card';
import Checkbox from '@/ds-components/Checkbox';
import FormField from '@/ds-components/FormField';

import type { SignInExperienceForm } from '../../../types';
import FormFieldDescription from '../../components/FormFieldDescription';
import FormSectionTitle from '../../components/FormSectionTitle';

import SocialConnectorEditBox from './SocialConnectorEditBox';
import styles from './index.module.scss';

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
        <FormField title="sign_in_exp.sign_up_and_sign_in.social_sign_in.settings_title">
          <div className={styles.switchRows}>
            {isDevFeaturesEnabled && (
              <Controller
                control={control}
                name="socialSignIn.skipRequiredIdentifiers"
                render={({ field: { value, onChange } }) => (
                  <Checkbox
                    label={t(
                      'sign_in_exp.sign_up_and_sign_in.social_sign_in.required_sign_up_identifiers'
                    )}
                    suffixTooltip={t(
                      'sign_in_exp.sign_up_and_sign_in.social_sign_in.required_sign_up_identifiers_tip'
                    )}
                    // NOTE: Invert the value to match the label meaning
                    checked={!value}
                    onChange={(value) => {
                      onChange(!value);
                    }}
                  />
                )}
              />
            )}
            <Controller
              control={control}
              name="socialSignIn.automaticAccountLinking"
              render={({ field: { value, onChange } }) => (
                <Checkbox
                  label={t(
                    'sign_in_exp.sign_up_and_sign_in.social_sign_in.automatic_account_linking'
                  )}
                  suffixTooltip={t(
                    'sign_in_exp.sign_up_and_sign_in.social_sign_in.automatic_account_linking_tip'
                  )}
                  checked={value}
                  onChange={onChange}
                />
              )}
            />
          </div>
        </FormField>
      )}
    </Card>
  );
}

export default SocialSignInForm;
