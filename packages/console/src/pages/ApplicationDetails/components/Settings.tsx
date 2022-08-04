import { Application, ApplicationType, SnakeCaseOidcConfig } from '@logto/schemas';
import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CopyToClipboard from '@/components/CopyToClipboard';
import FormField from '@/components/FormField';
import MultiTextInput from '@/components/MultiTextInput';
import { MultiTextInputRule } from '@/components/MultiTextInput/types';
import { createValidatorForRhf, convertRhfErrorMessage } from '@/components/MultiTextInput/utils';
import TextInput from '@/components/TextInput';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { uriOriginValidator, uriValidator } from '@/utilities/validator';

import * as styles from '../index.module.scss';

type Props = {
  applicationType: ApplicationType;
  oidcConfig: SnakeCaseOidcConfig;
  defaultData: Application;
  isDeleted: boolean;
};

const Settings = ({ applicationType, oidcConfig, defaultData, isDeleted }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    control,
    register,
    reset,
    formState: { errors, isDirty },
  } = useFormContext<Application>();

  useEffect(() => {
    reset(defaultData);

    return () => {
      reset(defaultData);
    };
  }, [reset, defaultData]);

  const uriPatternRules: MultiTextInputRule = {
    pattern: {
      verify: (value) => !value || uriValidator(value),
      message: t('errors.invalid_uri_format'),
    },
  };

  return (
    <>
      <FormField
        isRequired
        title="application_details.application_name"
        className={styles.textField}
      >
        <TextInput
          {...register('name', { required: true })}
          hasError={Boolean(errors.name)}
          placeholder={t('application_details.application_name_placeholder')}
        />
      </FormField>
      <FormField title="application_details.description" className={styles.textField}>
        <TextInput
          {...register('description')}
          placeholder={t('application_details.description_placeholder')}
        />
      </FormField>
      {applicationType === ApplicationType.Traditional && (
        <FormField title="application_details.application_secret" className={styles.textField}>
          <CopyToClipboard
            hasVisibilityToggle
            className={styles.textField}
            value={defaultData.secret}
            variant="border"
          />
        </FormField>
      )}
      <FormField
        title="application_details.authorization_endpoint"
        className={styles.textField}
        tooltip="application_details.authorization_endpoint_tip"
      >
        <CopyToClipboard
          className={styles.textField}
          value={oidcConfig.authorization_endpoint}
          variant="border"
        />
      </FormField>
      <FormField
        isRequired
        title="application_details.redirect_uris"
        className={styles.textField}
        tooltip="application_details.redirect_uri_tip"
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
              title="application_details.redirect_uris"
              value={value}
              error={convertRhfErrorMessage(error?.message)}
              placeholder={
                applicationType === ApplicationType.Native
                  ? t('application_details.redirect_uri_placeholder_native')
                  : t('application_details.redirect_uri_placeholder')
              }
              onChange={onChange}
            />
          )}
        />
      </FormField>
      <FormField
        title="application_details.post_sign_out_redirect_uris"
        className={styles.textField}
        tooltip="application_details.post_sign_out_redirect_uri_tip"
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
              title="application_details.post_sign_out_redirect_uris"
              value={value}
              error={convertRhfErrorMessage(error?.message)}
              placeholder={t('application_details.post_sign_out_redirect_uri_placeholder')}
              onChange={onChange}
            />
          )}
        />
      </FormField>
      <FormField
        title="application_details.cors_allowed_origins"
        className={styles.textField}
        tooltip="application_details.cors_allowed_origins_tip"
      >
        <Controller
          name="customClientMetadata.corsAllowedOrigins"
          control={control}
          defaultValue={[]}
          rules={{
            validate: createValidatorForRhf({
              pattern: {
                verify: (value) => !value || uriOriginValidator(value),
                message: t('errors.invalid_origin_format'),
              },
            }),
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <MultiTextInput
              title="application_details.cors_allowed_origins"
              value={value}
              error={convertRhfErrorMessage(error?.message)}
              placeholder={t('application_details.cors_allowed_origins_placeholder')}
              onChange={onChange}
            />
          )}
        />
      </FormField>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} />
    </>
  );
};

export default Settings;
