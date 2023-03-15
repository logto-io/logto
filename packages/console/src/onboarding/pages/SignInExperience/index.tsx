import type { SignInExperience as SignInExperienceType } from '@logto/schemas';
import { SignInIdentifier } from '@logto/schemas';
import { useCallback, useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import Tools from '@/assets/images/tools.svg';
import Button from '@/components/Button';
import ColorPicker from '@/components/ColorPicker';
import FormField from '@/components/FormField';
import OverlayScrollbar from '@/components/OverlayScrollbar';
import TextInput from '@/components/TextInput';
import { ImageUploaderField } from '@/components/Uploader';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useUserAssetsService from '@/hooks/use-user-assets-service';
import ActionBar from '@/onboarding/components/ActionBar';
import { CardSelector, MultiCardSelector } from '@/onboarding/components/CardSelector';
import * as pageLayout from '@/onboarding/scss/layout.module.scss';
import { Authentication, OnboardingPage } from '@/onboarding/types';
import type { OnboardingSieConfig } from '@/onboarding/types';
import { getOnboardingPage } from '@/onboarding/utils';
import { uriValidator } from '@/utils/validator';

import InspireMe from './components/InspireMe';
import Preview from './components/Preview';
import SocialSelector from './components/SocialSelector';
import * as styles from './index.module.scss';
import { authenticationOptions, identifierOptions } from './options';
import { defaultOnboardingSieConfig } from './sie-config-templates';
import { parser } from './utils';

const SignInExperience = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();
  const { data: signInExperience, mutate } = useSWR<SignInExperienceType, RequestError>(
    'api/sign-in-exp'
  );

  const api = useApi();
  const { isReady: isUserAssetsServiceReady } = useUserAssetsService();

  const {
    reset,
    control,
    watch,
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<OnboardingSieConfig>({ defaultValues: defaultOnboardingSieConfig });

  const updateAuthenticationConfig = useCallback(() => {
    const identifier = getValues('identifier');

    if (identifier === SignInIdentifier.Username) {
      setValue('authentications', [Authentication.Password]);
    }
  }, [getValues, setValue]);

  useEffect(() => {
    if (signInExperience) {
      reset(parser.signInExperienceToOnboardSieConfig(signInExperience));
      updateAuthenticationConfig();
    }
  }, [reset, signInExperience, updateAuthenticationConfig]);

  const onboardingSieConfig = watch();

  const previewSieConfig = useMemo(() => {
    if (signInExperience) {
      return parser.onboardSieConfigToSignInExperience(onboardingSieConfig, signInExperience);
    }
  }, [onboardingSieConfig, signInExperience]);

  const submit = (onSuccess: () => void) => async (formData: OnboardingSieConfig) => {
    if (!signInExperience) {
      return;
    }

    const updatedData = await api
      .patch('api/sign-in-exp', {
        json: parser.onboardSieConfigToSignInExperience(formData, signInExperience),
      })
      .json<SignInExperienceType>();

    void mutate(updatedData);

    onSuccess();
  };

  return (
    <div className={pageLayout.page}>
      <OverlayScrollbar className={pageLayout.contentContainer}>
        <div className={styles.content}>
          <div className={styles.config}>
            <Tools />
            <div className={styles.title}>{t('cloud.sie.title')}</div>
            <InspireMe
              onInspired={(template) => {
                reset(template);
                updateAuthenticationConfig();
              }}
            />
            <FormField title="cloud.sie.logo_field">
              {isUserAssetsServiceReady ? (
                <Controller
                  name="logo"
                  control={control}
                  render={({ field: { onChange, value, name } }) => (
                    <ImageUploaderField name={name} value={value ?? ''} onChange={onChange} />
                  )}
                />
              ) : (
                <TextInput
                  size="large"
                  {...register('logo', {
                    validate: (value) =>
                      !value || uriValidator(value) || t('errors.invalid_uri_format'),
                  })}
                  hasError={Boolean(errors.logo)}
                  errorMessage={errors.logo?.message}
                />
              )}
            </FormField>
            <FormField title="cloud.sie.color_field">
              <Controller
                name="color"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <ColorPicker value={value} onChange={onChange} />
                )}
              />
            </FormField>
            <FormField
              title="cloud.sie.identifier_field"
              headlineClassName={styles.cardFieldHeadline}
            >
              <Controller
                name="identifier"
                control={control}
                render={({ field: { name, value, onChange } }) => (
                  <CardSelector
                    name={name}
                    value={value}
                    options={identifierOptions}
                    onChange={(value) => {
                      onChange(value);
                      updateAuthenticationConfig();
                    }}
                  />
                )}
              />
            </FormField>
            <FormField
              isMultiple
              title="cloud.sie.authn_field"
              headlineClassName={styles.cardFieldHeadline}
            >
              <Controller
                name="authentications"
                control={control}
                defaultValue={defaultOnboardingSieConfig.authentications}
                render={({ field: { value, onChange } }) => (
                  <MultiCardSelector
                    isNotAllowEmpty
                    className={styles.authnSelector}
                    value={value}
                    options={authenticationOptions.filter(
                      ({ value }) =>
                        onboardingSieConfig.identifier !== SignInIdentifier.Username ||
                        value === Authentication.Password
                    )}
                    onChange={onChange}
                  />
                )}
              />
            </FormField>
            <FormField
              isMultiple
              title="cloud.sie.social_field"
              headlineClassName={styles.cardFieldHeadline}
            >
              <Controller
                name="socialTargets"
                control={control}
                defaultValue={defaultOnboardingSieConfig.socialTargets}
                render={({ field: { value, onChange } }) => (
                  <SocialSelector value={value ?? []} onChange={onChange} />
                )}
              />
            </FormField>
          </div>
          <Preview
            className={styles.preview}
            signInExperience={previewSieConfig}
            isLivePreviewDisabled={isDirty}
          />
        </div>
      </OverlayScrollbar>
      <ActionBar step={3}>
        <div className={styles.continueActions}>
          <Button
            type="outline"
            title="general.save"
            disabled={isSubmitting}
            onClick={async () => {
              await handleSubmit(
                submit(() => {
                  toast.success(t('general.saved'));
                })
              )();
            }}
          />
          <Button
            type="primary"
            title="cloud.sie.finish_and_done"
            disabled={isSubmitting}
            onClick={async () => {
              await handleSubmit(
                submit(() => {
                  navigate(getOnboardingPage(OnboardingPage.Congrats), { replace: true });
                })
              )();
            }}
          />
        </div>
        <Button
          title="general.back"
          disabled={isSubmitting}
          onClick={() => {
            navigate(getOnboardingPage(OnboardingPage.AboutUser), { replace: true });
          }}
        />
      </ActionBar>
    </div>
  );
};

export default SignInExperience;
