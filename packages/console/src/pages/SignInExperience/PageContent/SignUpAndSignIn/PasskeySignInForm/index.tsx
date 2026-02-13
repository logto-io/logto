import { useContext } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { latestProPlanId } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Card from '@/ds-components/Card';
import Checkbox from '@/ds-components/Checkbox';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import { type SignInExperienceForm } from '@/pages/SignInExperience/types';

import FormSectionTitle from '../../components/FormSectionTitle';

import styles from './index.module.scss';

function PasskeySignInForm() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { control, register } = useFormContext<SignInExperienceForm>();

  const { currentSubscriptionQuota } = useContext(SubscriptionDataContext);
  const isPasskeySignInEnabled = currentSubscriptionQuota.passkeySignInEnabled;

  return (
    <Card>
      <FormSectionTitle title="sign_up_and_sign_in.passkey_sign_in.title" />
      <FormField
        title="sign_in_exp.sign_up_and_sign_in.passkey_sign_in.passkey_sign_in"
        featureTag={{
          isVisible: !isPasskeySignInEnabled,
          plan: latestProPlanId,
        }}
      >
        <Switch
          {...register('passkeySignIn.enabled')}
          disabled={!isPasskeySignInEnabled}
          label={t(
            'sign_in_exp.sign_up_and_sign_in.passkey_sign_in.enable_passkey_sign_in_description'
          )}
        />
      </FormField>
      <FormField title="sign_in_exp.sign_up_and_sign_in.passkey_sign_in.prompts">
        <div className={styles.checkboxes}>
          <Controller
            control={control}
            name="passkeySignIn.showPasskeyButton"
            render={({ field: { value, onChange } }) => (
              <Checkbox
                disabled={!isPasskeySignInEnabled}
                label={t('sign_in_exp.sign_up_and_sign_in.passkey_sign_in.show_passkey_button')}
                suffixTooltip={t(
                  'sign_in_exp.sign_up_and_sign_in.passkey_sign_in.show_passkey_button_tip'
                )}
                checked={value}
                onChange={onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="passkeySignIn.allowAutofill"
            render={({ field: { value, onChange } }) => (
              <Checkbox
                disabled={!isPasskeySignInEnabled}
                label={t('sign_in_exp.sign_up_and_sign_in.passkey_sign_in.allow_autofill')}
                checked={value}
                onChange={onChange}
              />
            )}
          />
        </div>
      </FormField>
    </Card>
  );
}

export default PasskeySignInForm;
