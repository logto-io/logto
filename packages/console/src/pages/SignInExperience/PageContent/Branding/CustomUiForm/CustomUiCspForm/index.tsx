import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import MultiTextInputField from '@/components/MultiTextInputField';
import { isProduction } from '@/consts/env';
import DynamicT from '@/ds-components/DynamicT';
import { convertRhfErrorMessage } from '@/ds-components/MultiTextInput/utils';

import type { SignInExperienceForm } from '../../../../types';
import styles from '../index.module.scss';

import { createCustomUiCspValidator } from './utils';

type Props = {
  readonly isDisabled: boolean;
};

function CustomUiCspForm({ isDisabled }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { control } = useFormContext<SignInExperienceForm>();

  const validationMessages = {
    duplicate: t('sign_in_exp.custom_ui.csp_source_duplicate_error'),
    invalid: t('sign_in_exp.custom_ui.csp_source_invalid_error'),
  };

  return (
    <div className={styles.cspConfig}>
      <Controller
        name="customUiCsp.scriptSrc"
        control={control}
        defaultValue={[]}
        rules={{
          validate: createCustomUiCspValidator('scriptSrc', validationMessages, {
            isProductionEnv: isProduction,
          }),
        }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <MultiTextInputField
            isDisabled={isDisabled}
            title="sign_in_exp.custom_ui.csp_script_src"
            tip={t('sign_in_exp.custom_ui.csp_script_src_tip')}
            value={value}
            error={convertRhfErrorMessage(error?.message)}
            placeholder="https://scripts.example.com"
            onChange={onChange}
          />
        )}
      />
      <Controller
        name="customUiCsp.connectSrc"
        control={control}
        defaultValue={[]}
        rules={{
          validate: createCustomUiCspValidator('connectSrc', validationMessages, {
            isProductionEnv: isProduction,
          }),
        }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <MultiTextInputField
            isDisabled={isDisabled}
            title="sign_in_exp.custom_ui.csp_connect_src"
            tip={t('sign_in_exp.custom_ui.csp_connect_src_tip')}
            value={value}
            error={convertRhfErrorMessage(error?.message)}
            placeholder="https://api.example.com"
            onChange={onChange}
          />
        )}
      />
      <div className={styles.cspDescription}>
        <DynamicT forKey="sign_in_exp.custom_ui.csp_description" />
      </div>
    </div>
  );
}

export default CustomUiCspForm;
