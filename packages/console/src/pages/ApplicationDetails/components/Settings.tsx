import type { Application } from '@logto/schemas';
import { ApplicationType, validateRedirectUrl } from '@logto/schemas';
import { useContext } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';

import FormCard from '@/components/FormCard';
import MultiTextInputField from '@/components/MultiTextInputField';
import { AppDataContext } from '@/contexts/AppDataProvider';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import type { MultiTextInputRule } from '@/ds-components/MultiTextInput/types';
import {
  createValidatorForRhf,
  convertRhfErrorMessage,
} from '@/ds-components/MultiTextInput/utils';
import TextInput from '@/ds-components/TextInput';
import TextLink from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';

import * as styles from '../index.module.scss';
import { type ApplicationDetailsOutletContext } from '../types';

function Settings() {
  const { tenantEndpoint } = useContext(AppDataContext);
  const { app: data } = useOutletContext<ApplicationDetailsOutletContext>();

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
          error={Boolean(errors.name)}
          placeholder={t('application_details.application_name_placeholder')}
        />
      </FormField>
      {tenantEndpoint && (
        <FormField title="application_details.logto_endpoint">
          <CopyToClipboard
            value={tenantEndpoint.href}
            variant="border"
            className={styles.textField}
          />
        </FormField>
      )}
      <FormField title="application_details.description">
        <TextInput
          {...register('description')}
          placeholder={t('application_details.description_placeholder')}
        />
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
