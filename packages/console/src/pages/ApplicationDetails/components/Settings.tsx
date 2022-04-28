import { Application, SnakeCaseOidcConfig } from '@logto/schemas';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CopyToClipboard from '@/components/CopyToClipboard';
import FormField from '@/components/FormField';
import MultiTextInput from '@/components/MultiTextInput';
import { MultiTextInputRule } from '@/components/MultiTextInput/types';
import { createValidatorForRhf, convertRhfErrorMessage } from '@/components/MultiTextInput/utils';
import TextInput from '@/components/TextInput';
import { uriValidator } from '@/utilities/validator';

import * as styles from '../index.module.scss';

type Props = {
  oidcConfig: SnakeCaseOidcConfig;
};

const Settings = ({ oidcConfig }: Props) => {
  const { control, register } = useFormContext<Application>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const uriPatternRules: MultiTextInputRule = {
    pattern: {
      verify: uriValidator(false),
      message: t('errors.invalid_uri_format'),
    },
  };

  return (
    <>
      <FormField
        isRequired
        title="admin_console.application_details.application_name"
        className={styles.textField}
      >
        <TextInput {...register('name', { required: true })} />
      </FormField>
      <FormField title="admin_console.application_details.description" className={styles.textField}>
        <TextInput {...register('description')} />
      </FormField>
      <FormField
        title="admin_console.application_details.authorization_endpoint"
        className={styles.textField}
      >
        <CopyToClipboard
          className={styles.textField}
          value={oidcConfig.authorization_endpoint}
          variant="border"
        />
      </FormField>
      <FormField
        isRequired
        title="admin_console.application_details.redirect_uri"
        className={styles.textField}
      >
        <Controller
          name="oidcClientMetadata.redirectUris"
          control={control}
          defaultValue={[]}
          rules={{
            validate: createValidatorForRhf({
              ...uriPatternRules,
              required: t('application_details.redirect_uri_required'),
            }),
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <MultiTextInput
              value={value}
              error={convertRhfErrorMessage(error?.message)}
              onChange={onChange}
            />
          )}
        />
      </FormField>
      <FormField
        title="admin_console.application_details.post_sign_out_redirect_uri"
        className={styles.textField}
      >
        <Controller
          name="oidcClientMetadata.postLogoutRedirectUris"
          control={control}
          defaultValue={[]}
          rules={{
            validate: createValidatorForRhf(uriPatternRules),
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <MultiTextInput
              value={value}
              error={convertRhfErrorMessage(error?.message)}
              onChange={onChange}
            />
          )}
        />
      </FormField>
      <FormField
        title="admin_console.application_details.cors_allowed_origins"
        className={styles.textField}
      >
        <Controller
          name="customClientMetadata.corsAllowedOrigins"
          control={control}
          defaultValue={[]}
          rules={{
            validate: createValidatorForRhf(uriPatternRules),
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <MultiTextInput
              value={value}
              error={convertRhfErrorMessage(error?.message)}
              onChange={onChange}
            />
          )}
        />
      </FormField>
    </>
  );
};

export default Settings;
