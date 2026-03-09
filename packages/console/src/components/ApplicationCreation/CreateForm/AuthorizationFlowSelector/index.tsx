import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/ds-components/FormField';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';

import styles from '../index.module.scss';
import type { CreateApplicationFormData } from '../types';

function AuthorizationFlowSelector() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { control } = useFormContext<CreateApplicationFormData>();

  return (
    <FormField
      title="applications.authorization_flow.title"
      tip={t('applications.authorization_flow.tooltip')}
    >
      <Controller
        name="isDeviceFlow"
        control={control}
        render={({ field: { onChange, value } }) => (
          <RadioGroup
            className={styles.authorizationFlowRadioGroup}
            name="isDeviceFlow"
            value={value ? 'device_flow' : 'authorization_code'}
            type="card"
            onChange={(radioValue) => {
              onChange(radioValue === 'device_flow');
            }}
          >
            <Radio value="authorization_code">
              <div className={styles.authFlowCard}>
                <div className={styles.authFlowCardTitle}>
                  {t('applications.authorization_flow.authorization_code.title')}
                </div>
                <div className={styles.authFlowCardDescription}>
                  {t('applications.authorization_flow.authorization_code.description')}
                </div>
              </div>
            </Radio>
            <Radio value="device_flow">
              <div className={styles.authFlowCard}>
                <div className={styles.authFlowCardTitle}>
                  {t('applications.authorization_flow.device_flow.title')}
                </div>
                <div className={styles.authFlowCardDescription}>
                  {t('applications.authorization_flow.device_flow.description')}
                </div>
              </div>
            </Radio>
          </RadioGroup>
        )}
      />
    </FormField>
  );
}

export default AuthorizationFlowSelector;
