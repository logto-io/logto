import { type CaptchaPolicy, type SignInExperience } from '@logto/schemas';
import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Checkbox from '@/ds-components/Checkbox';
import FormField from '@/ds-components/FormField';
import { type RequestError } from '@/hooks/use-api';

import styles from './index.module.scss';

function RequiredFlows() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { control, reset } = useFormContext<CaptchaPolicy>();
  const { data, isLoading } = useSWR<SignInExperience, RequestError>('api/sign-in-exp');

  useEffect(() => {
    if (data) {
      reset(data.captchaPolicy);
    }
  }, [data, reset]);

  if (isLoading) {
    return null;
  }

  return (
    <div className={styles.container}>
      <FormField title="security.bot_protection.captcha_required_flows">
        <div className={styles.line}>
          <Controller
            defaultValue
            name="signIn"
            control={control}
            render={({ field }) => (
              <Checkbox
                label={t('security.bot_protection.sign_in')}
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <div className={styles.line}>
          <Controller
            defaultValue
            name="signUp"
            control={control}
            render={({ field }) => (
              <Checkbox
                label={t('security.bot_protection.sign_up')}
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <div className={styles.line}>
          <Controller
            defaultValue
            name="forgotPassword"
            control={control}
            render={({ field }) => (
              <Checkbox
                label={t('security.bot_protection.forgot_password')}
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </FormField>
    </div>
  );
}

export default RequiredFlows;
