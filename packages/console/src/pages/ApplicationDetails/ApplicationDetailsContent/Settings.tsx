import { validateRedirectUrl } from '@logto/core-kit';
import type { Application } from '@logto/schemas';
import { ApplicationType } from '@logto/schemas';
import { Controller, useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import MultiTextInputField from '@/components/MultiTextInputField';
import { applicationDataStructure, thirdPartyApp } from '@/consts';
import CodeEditor from '@/ds-components/CodeEditor';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import type { MultiTextInputRule } from '@/ds-components/MultiTextInput/types';
import {
  convertRhfErrorMessage,
  createValidatorForRhf,
} from '@/ds-components/MultiTextInput/utils';
import TextInput from '@/ds-components/TextInput';
import TextLink from '@/ds-components/TextLink';
import { isJsonObject } from '@/utils/json';

import ProtectedAppSettings from './ProtectedAppSettings';
import styles from './index.module.scss';
import { type ApplicationForm } from './utils';

const hasMixedUriProtocols = (applicationType: ApplicationType, uris: string[]): boolean => {
  switch (applicationType) {
    case ApplicationType.Native: {
      return uris.some((uri) => validateRedirectUrl(uri, 'web'));
    }
    case ApplicationType.Traditional:
    case ApplicationType.SPA: {
      return uris.some((uri) => validateRedirectUrl(uri, 'mobile'));
    }
    default: {
      return false;
    }
  }
};

const hasWildcardUri = (uris?: string[]) => Boolean(uris?.some((uri) => uri.includes('*')));

/**
 * Validates redirect URIs based on application type.
 * Wildcards are only allowed for web applications (SPA and Traditional), not for native apps.
 */
const createRedirectUriValidator = (applicationType: ApplicationType) => (value: string) => {
  // Native apps don't support wildcard redirect URIs
  if (applicationType === ApplicationType.Native && value.includes('*')) {
    return false;
  }
  return validateRedirectUrl(value, 'web') || validateRedirectUrl(value, 'mobile');
};

function MixedUriWarning() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  return (
    <InlineNotification severity="alert" className={styles.mixedUriWarning}>
      {t('application_details.mixed_redirect_uri_warning')}
    </InlineNotification>
  );
}

function WildcardUriWarning() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  return (
    <InlineNotification severity="alert" className={styles.mixedUriWarning}>
      {t('application_details.wildcard_redirect_uri_warning')}
    </InlineNotification>
  );
}

type Props = {
  readonly data: Application;
};

function Settings({ data }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<ApplicationForm>();

  const { type: applicationType, isThirdParty } = data;

  const isProtectedApp = applicationType === ApplicationType.Protected;
  const redirectUriValidator = createRedirectUriValidator(applicationType);
  const uriPatternRules: MultiTextInputRule = {
    pattern: {
      verify: (value) => !value || redirectUriValidator(value),
      message: t('errors.invalid_uri_format'),
    },
  };
  const redirectUris = watch('oidcClientMetadata.redirectUris');
  const postLogoutRedirectUris = watch('oidcClientMetadata.postLogoutRedirectUris');
  const showRedirectUriMixedWarning = hasMixedUriProtocols(applicationType, redirectUris);
  const showPostLogoutUriMixedWarning = hasMixedUriProtocols(
    applicationType,
    postLogoutRedirectUris
  );
  const showRedirectUriWildcardWarning = hasWildcardUri(redirectUris);
  const showPostLogoutUriWildcardWarning = hasWildcardUri(postLogoutRedirectUris);

  if (isProtectedApp) {
    return <ProtectedAppSettings data={data} />;
  }

  return (
    <FormCard
      title="application_details.settings"
      description={`application_details.${isThirdParty ? 'third_party_' : ''}settings_description`}
      learnMoreLink={{ href: isThirdParty ? thirdPartyApp : applicationDataStructure }}
    >
      <FormField isRequired title="application_details.application_name">
        <TextInput
          {...register('name', { required: true })}
          error={Boolean(errors.name)}
          placeholder={t('application_details.application_name_placeholder')}
        />
      </FormField>
      <FormField title="application_details.description">
        <TextInput
          {...register('description')}
          placeholder={t('application_details.description_placeholder')}
        />
      </FormField>
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
                        targetBlank
                        href="https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest"
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
      {showRedirectUriWildcardWarning && <WildcardUriWarning />}
      {showRedirectUriMixedWarning && <MixedUriWarning />}
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
      {showPostLogoutUriWildcardWarning && <WildcardUriWarning />}
      {showPostLogoutUriMixedWarning && <MixedUriWarning />}
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
                        targetBlank
                        href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS"
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
      <Controller
        name="customData"
        control={control}
        defaultValue="{}"
        rules={{
          validate: (value) =>
            isJsonObject(value ?? '') ? true : t('application_details.custom_data_invalid'),
        }}
        render={({ field: { value, onChange } }) => (
          <FormField
            title="application_details.field_custom_data"
            tip={t('application_details.field_custom_data_tip')}
          >
            <CodeEditor
              language="json"
              value={value}
              error={errors.customData?.message}
              onChange={onChange}
            />
          </FormField>
        )}
      />
    </FormCard>
  );
}

export default Settings;
