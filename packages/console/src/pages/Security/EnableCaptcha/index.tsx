import { type CaptchaPolicy, type SignInExperience } from '@logto/schemas';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import { type RequestError } from '@/hooks/use-api';

import styles from './index.module.scss';

function EnableCaptcha() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { register, reset } = useFormContext<CaptchaPolicy>();
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
      <FormField title="security.bot_protection.enable_captcha">
        <div className={styles.line}>
          <Switch
            label={t('security.bot_protection.enable_captcha_description')}
            {...register('enabled')}
          />
        </div>
      </FormField>
    </div>
  );
}

export default EnableCaptcha;
