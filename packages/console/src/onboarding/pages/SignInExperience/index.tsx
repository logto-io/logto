import { ConnectorType, ServiceConnector } from '@logto/connector-kit';
import { SignInIdentifier } from '@logto/schemas';
import type { SignInExperience as SignInExperienceType, ConnectorResponse } from '@logto/schemas';
import { useCallback, useEffect, useMemo, useContext } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Tools from '@/assets/icons/tools.svg';
import ActionBar from '@/components/ActionBar';
import { GtagConversionId, reportConversion } from '@/components/Conversion/utils';
import PageMeta from '@/components/PageMeta';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import ColorPicker from '@/ds-components/ColorPicker';
import FormField from '@/ds-components/FormField';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import TextInput from '@/ds-components/TextInput';
import ImageUploaderField from '@/ds-components/Uploader/ImageUploaderField';
import useApi from '@/hooks/use-api';
import type { RequestError } from '@/hooks/use-api';
import useCurrentUser from '@/hooks/use-current-user';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useUserAssetsService from '@/hooks/use-user-assets-service';
import { CardSelector, MultiCardSelector } from '@/onboarding/components/CardSelector';
import useUserOnboardingData from '@/onboarding/hooks/use-user-onboarding-data';
import * as pageLayout from '@/onboarding/scss/layout.module.scss';
import { OnboardingPage } from '@/onboarding/types';
import { getOnboardingPage } from '@/onboarding/utils';
import { trySubmitSafe } from '@/utils/form';
import { buildUrl } from '@/utils/url';
import { uriValidator } from '@/utils/validator';

import InspireMe from './InspireMe';
import Preview from './Preview';
import Skeleton from './Skeleton';
import SocialSelector from './SocialSelector';
import { formDataParser } from './form-data-parser';
import * as styles from './index.module.scss';
import { authenticationOptions, identifierOptions } from './options';
import { defaultOnboardingSieFormData } from './sie-config-templates';
import { Authentication, type OnboardingSieFormData } from './types';

function SignInExperience() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();
  const {
    data: signInExperience,
    error,
    mutate,
  } = useSWR<SignInExperienceType, RequestError>('api/sign-in-exp');
  const isSignInExperienceDataLoading = !error && !signInExperience;
  const { isLoading: isUserAssetsServiceLoading } = useUserAssetsService();
  const isLoading = isSignInExperienceDataLoading || isUserAssetsServiceLoading;
  const api = useApi();
  const { isReady: isUserAssetsServiceReady } = useUserAssetsService();
  const { update } = useUserOnboardingData();
  const { user } = useCurrentUser();
  const { navigateTenant, currentTenantId } = useContext(TenantsContext);

  const enterAdminConsole = async () => {
    await update({ isOnboardingDone: true });
    navigateTenant(currentTenantId);
  };

  const {
    reset,
    control,
    watch,
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<OnboardingSieFormData>({ defaultValues: defaultOnboardingSieFormData });

  const updateAuthenticationConfig = useCallback(() => {
    const identifier = getValues('identifier');

    if (identifier === SignInIdentifier.Username) {
      setValue('authentications', [Authentication.Password]);
    }
  }, [getValues, setValue]);

  useEffect(() => {
    if (signInExperience) {
      reset(formDataParser.fromSignInExperience(signInExperience));
      updateAuthenticationConfig();
    }
  }, [reset, signInExperience, updateAuthenticationConfig]);

  const onboardingSieFormData = watch();

  const previewSieConfig = useMemo(() => {
    if (signInExperience) {
      return formDataParser.toSignInExperience(onboardingSieFormData, signInExperience);
    }
  }, [onboardingSieFormData, signInExperience]);

  const submit = (onSuccess: () => void) =>
    trySubmitSafe(async (formData: OnboardingSieFormData) => {
      if (!signInExperience) {
        return;
      }

      /**
       * If choose `Email` as `identifier`, we will create email service connector for the tenant (when there is no existing email connector).
       * Should create this connector before updating the sign-in experience, otherwise the sign-in experience can not be updated.
       */
      if (formData.identifier === SignInIdentifier.Email) {
        const connectors = await api.get('api/connectors').json<ConnectorResponse[]>();
        if (!connectors.some(({ type }) => type === ConnectorType.Email)) {
          await api.post('api/connectors', {
            json: {
              connectorId: ServiceConnector.Email,
            },
          });
        }
      }

      const [updatedData] = await Promise.all([
        api
          .patch(buildUrl('api/sign-in-exp', { removeUnusedDemoSocialConnector: '1' }), {
            json: formDataParser.toUpdateOnboardingSieData(formData, signInExperience),
          })
          .json<SignInExperienceType>(),
        reportConversion({
          gtagId: GtagConversionId.SignUp,
          redditType: 'SignUp',
          transactionId: user?.id,
        }),
      ]);

      void mutate(updatedData);

      onSuccess();
    });

  if (isLoading) {
    return <Skeleton />;
  }

  return (
    <div className={pageLayout.page}>
      <PageMeta titleKey={['cloud.sie.page_title', 'cloud.general.onboarding']} />
      <OverlayScrollbar className={pageLayout.contentContainer}>
        <div className={styles.content}>
          <div className={styles.config}>
            <Tools />
            <div className={styles.title}>{t('cloud.sie.title')}</div>
            <InspireMe
              onInspired={(template) => {
                for (const [key, value] of Object.entries(template)) {
                  // eslint-disable-next-line no-restricted-syntax
                  setValue(key as keyof OnboardingSieFormData, value, { shouldDirty: true });
                }
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
                  {...register('logo', {
                    validate: (value) =>
                      !value || uriValidator(value) || t('errors.invalid_uri_format'),
                  })}
                  error={errors.logo?.message}
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
            <FormField title="cloud.sie.identifier_field" headlineSpacing="large">
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
            <FormField isMultiple title="cloud.sie.authn_field" headlineSpacing="large">
              <Controller
                name="authentications"
                control={control}
                defaultValue={defaultOnboardingSieFormData.authentications}
                render={({ field: { value, onChange } }) => (
                  <MultiCardSelector
                    isNotAllowEmpty
                    className={styles.authnSelector}
                    value={value}
                    options={authenticationOptions.filter(
                      ({ value }) =>
                        onboardingSieFormData.identifier !== SignInIdentifier.Username ||
                        value === Authentication.Password
                    )}
                    onChange={onChange}
                  />
                )}
              />
            </FormField>
            <FormField isMultiple title="cloud.sie.social_field" headlineSpacing="large">
              <Controller
                name="socialTargets"
                control={control}
                defaultValue={defaultOnboardingSieFormData.socialTargets}
                render={({ field: { value, onChange } }) => (
                  <SocialSelector value={value ?? []} onChange={onChange} />
                )}
              />
            </FormField>
          </div>
          <Preview className={styles.preview} signInExperience={previewSieConfig} />
        </div>
      </OverlayScrollbar>
      <ActionBar step={2} totalSteps={2}>
        <div className={styles.continueActions}>
          <Button
            type="primary"
            title="cloud.sie.finish_and_done"
            disabled={isSubmitting}
            onClick={async () => {
              await handleSubmit(submit(enterAdminConsole))();
            }}
          />
        </div>
        <Button
          title="general.back"
          disabled={isSubmitting}
          onClick={() => {
            navigate(getOnboardingPage(OnboardingPage.Welcome));
          }}
        />
      </ActionBar>
    </div>
  );
}

export default SignInExperience;
