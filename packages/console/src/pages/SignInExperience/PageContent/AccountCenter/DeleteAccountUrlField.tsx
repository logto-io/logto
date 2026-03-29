import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';

import type { SignInExperienceForm, AccountCenterFormValues } from '../../types';

import styles from './index.module.scss';

type Props = {
  readonly isAccountApiEnabled: boolean;
};

function DeleteAccountUrlField({ isAccountApiEnabled }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { control } = useFormContext<
    SignInExperienceForm & { accountCenter: AccountCenterFormValues }
  >();

  return (
    <FormField title="sign_in_exp.account_center.delete_account_url">
      <div className={styles.description}>
        <DynamicT forKey="sign_in_exp.account_center.delete_account_url_description" />
      </div>
      <Controller
        name="accountCenter.deleteAccountUrl"
        control={control}
        defaultValue=""
        rules={{
          validate: (value) =>
            !value ||
            ((value.startsWith('https://') || value.startsWith('http://')) &&
              z.string().url().safeParse(value).success) ||
            t('errors.invalid_uri_format'),
        }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextInput
            value={value}
            error={error?.message}
            placeholder="https://example.com/delete-account"
            disabled={!isAccountApiEnabled}
            onChange={onChange}
          />
        )}
      />
    </FormField>
  );
}

export default DeleteAccountUrlField;
