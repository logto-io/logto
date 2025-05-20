import { type CaptchaPolicy } from '@logto/schemas';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';

import styles from './index.module.scss';

type Props = {
  // eslint-disable-next-line react/boolean-prop-naming
  readonly disabled?: boolean;
};

function EnableCaptcha({ disabled }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { register } = useFormContext<CaptchaPolicy>();

  return (
    <div className={styles.container}>
      <FormField title="security.bot_protection.enable_captcha">
        <div className={styles.line}>
          <Switch
            label={t('security.bot_protection.enable_captcha_description')}
            {...register('enabled')}
            disabled={disabled}
          />
        </div>
      </FormField>
    </div>
  );
}

export default EnableCaptcha;
