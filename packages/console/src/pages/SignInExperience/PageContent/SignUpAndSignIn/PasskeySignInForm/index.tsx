import { cond } from '@silverhand/essentials';
import { useContext, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import InlineUpsell from '@/components/InlineUpsell';
import { isCloud } from '@/consts/env';
import { latestProPlanId } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Card from '@/ds-components/Card';
import Checkbox from '@/ds-components/Checkbox';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import { type SignInExperienceForm } from '@/pages/SignInExperience/types';
import { isPaidPlan } from '@/utils/subscription';

import FormSectionTitle from '../../components/FormSectionTitle';

import styles from './index.module.scss';

function PasskeySignInForm() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { control, register, setValue, watch } = useFormContext<SignInExperienceForm>();

  const {
    currentSubscriptionQuota,
    currentSubscription: { planId, isEnterprisePlan },
  } = useContext(SubscriptionDataContext);
  const isPasskeySignInEnabled = currentSubscriptionQuota.passkeySignInEnabled || !isCloud;
  const isPaidTenant = isPaidPlan(planId, isEnterprisePlan);
  const watchEnableSwitch = watch('passkeySignIn.enabled');

  useEffect(() => {
    if (isPasskeySignInEnabled && watchEnableSwitch) {
      setValue('passkeySignIn.showPasskeyButton', true);
      setValue('passkeySignIn.allowAutofill', true);
    }
  }, [isPasskeySignInEnabled, watchEnableSwitch, setValue]);

  return (
    <Card>
      <FormSectionTitle title="sign_up_and_sign_in.passkey_sign_in.title" />
      <FormField
        title="sign_in_exp.sign_up_and_sign_in.passkey_sign_in.passkey_sign_in"
        featureTag={cond(
          isCloud && {
            isVisible: !isPaidTenant,
            plan: latestProPlanId,
          }
        )}
      >
        <Switch
          {...register('passkeySignIn.enabled')}
          disabled={!isPasskeySignInEnabled}
          label={t(
            'sign_in_exp.sign_up_and_sign_in.passkey_sign_in.enable_passkey_sign_in_description'
          )}
        />
      </FormField>
      {watchEnableSwitch && (
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
      )}
      {!isPasskeySignInEnabled && (
        <InlineUpsell
          for="passkey_sign_in"
          actionButtonText="upsell.view_plans"
          className={styles.inlineNote}
        />
      )}
    </Card>
  );
}

export default PasskeySignInForm;
