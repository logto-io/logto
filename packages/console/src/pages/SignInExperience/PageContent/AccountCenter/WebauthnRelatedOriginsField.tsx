import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import MultiTextInput from '@/ds-components/MultiTextInput';
import type { MultiTextInputRule } from '@/ds-components/MultiTextInput/types';
import {
  convertRhfErrorMessage,
  createValidatorForRhf,
} from '@/ds-components/MultiTextInput/utils';

import type { SignInExperienceForm, AccountCenterFormValues } from '../../types';

import styles from './index.module.scss';

type Props = {
  readonly isAccountApiEnabled: boolean;
};

function WebauthnRelatedOriginsField({ isAccountApiEnabled }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { control } = useFormContext<
    SignInExperienceForm & { accountCenter: AccountCenterFormValues }
  >();

  const originValidationRules: MultiTextInputRule = useMemo(
    () => ({
      pattern: {
        verify: (value) => !value || value.startsWith('https://') || value.startsWith('http://'),
        message: t('sign_in_exp.account_center.webauthn_related_origins_error'),
      },
    }),
    [t]
  );

  return (
    <FormField title="sign_in_exp.account_center.webauthn_related_origins">
      <div className={styles.description}>
        <DynamicT forKey="sign_in_exp.account_center.webauthn_related_origins_description" />
      </div>
      <Controller
        name="accountCenter.webauthnRelatedOrigins"
        control={control}
        defaultValue={[]}
        rules={{
          validate: createValidatorForRhf(originValidationRules),
        }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <MultiTextInput
            title="sign_in_exp.account_center.webauthn_related_origins"
            value={value}
            error={convertRhfErrorMessage(error?.message)}
            placeholder="https://account.example.com"
            isDisabled={!isAccountApiEnabled}
            onChange={onChange}
          />
        )}
      />
    </FormField>
  );
}

export default WebauthnRelatedOriginsField;
