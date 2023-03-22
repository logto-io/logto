import type { Application } from '@logto/schemas';
import { ApplicationType, validateRedirectUrl } from '@logto/schemas';
import { Controller, useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import CopyToClipboard from '@/components/CopyToClipboard';
import FormCard from '@/components/FormCard';
import FormField from '@/components/FormField';
import type { MultiTextInputRule } from '@/components/MultiTextInput/types';
import { createValidatorForRhf, convertRhfErrorMessage } from '@/components/MultiTextInput/utils';
import MultiTextInputField from '@/components/MultiTextInputField';
import TextInput from '@/components/TextInput';
import TextLink from '@/components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import { uriOriginValidator } from '@/utils/validator';

import * as styles from '../index.module.scss';

type Props = {
  data: Application;
};

function Settings({ data }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<Application>();

  const { id, secret, type: applicationType } = data;

  const isNativeApp = applicationType === ApplicationType.Native;
  const uriPatternRules: MultiTextInputRule = {
    pattern: {
      verify: (value) => !value || validateRedirectUrl(value, isNativeApp ? 'mobile' : 'web'),
      message: t('errors.invalid_uri_format'),
    },
  };

  return (
    <FormCard
      title="application_details.settings"
      description="application_details.settings_description"
      learnMoreLink={getDocumentationUrl('/docs/references/applications')}
    >
      <FormField isRequired title="application_details.application_name">
        <TextInput
          {...register('name', { required: true })}
          hasError={Boolean(errors.name)}
          placeholder={t('application_details.application_name_placeholder')}
        />
      </FormField>
      <FormField title="application_details.description">
        <TextInput
          {...register('description')}
          placeholder={t('application_details.description_placeholder')}
        />
      </FormField>
      <FormField
        title="application_details.application_id"
        tip={(closeTipHandler) => (
          <Trans
            components={{
              a: (
                <TextLink
                  href="https://openid.net/specs/openid-connect-core-1_0.html"
                  target="_blank"
                  onClick={closeTipHandler}
                />
              ),
            }}
          >
            {t('application_details.application_id_tip')}
          </Trans>
        )}
      >
        <CopyToClipboard value={id} variant="border" className={styles.textField} />
      </FormField>
      {[ApplicationType.Traditional, ApplicationType.MachineToMachine].includes(
        applicationType
      ) && (
        <FormField title="application_details.application_secret">
          <CopyToClipboard
            hasVisibilityToggle
            value={secret}
            variant="border"
            className={styles.textField}
          />
        </FormField>
      )}
      {applicationType !== ApplicationType.MachineToMachine && (
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
            <MultiTextInputField
              isRequired
              title="application_details.redirect_uris"
              tip={(closeTipHandler) => (
                <Trans
                  components={{
                    a: (
                      <TextLink
                        href="https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest"
                        target="_blank"
                        onClick={closeTipHandler}
                      />
                    ),
                  }}
                >
                  {t('application_details.redirect_uri_tip')}
                </Trans>
              )}
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
      )}
      {applicationType !== ApplicationType.MachineToMachine && (
        <Controller
          name="oidcClientMetadata.postLogoutRedirectUris"
          control={control}
          defaultValue={[]}
          rules={{
            validate: createValidatorForRhf(uriPatternRules),
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <MultiTextInputField
              title="application_details.post_sign_out_redirect_uris"
              tip={t('application_details.post_sign_out_redirect_uri_tip')}
              value={value}
              error={convertRhfErrorMessage(error?.message)}
              placeholder={t('application_details.post_sign_out_redirect_uri_placeholder')}
              onChange={onChange}
            />
          )}
        />
      )}
      {applicationType !== ApplicationType.MachineToMachine && (
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
            <MultiTextInputField
              title="application_details.cors_allowed_origins"
              tip={(closeTipHandler) => (
                <Trans
                  components={{
                    a: (
                      <TextLink
                        href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS"
                        target="_blank"
                        onClick={closeTipHandler}
                      />
                    ),
                  }}
                >
                  {t('application_details.cors_allowed_origins_tip')}
                </Trans>
              )}
              value={value}
              error={convertRhfErrorMessage(error?.message)}
              placeholder={t('application_details.cors_allowed_origins_placeholder')}
              onChange={onChange}
            />
          )}
        />
      )}
    </FormCard>
  );
}

export default Settings;
