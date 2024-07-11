import { generateDarkColor } from '@logto/core-kit';
import {
  Theme,
  defaultPrimaryColor,
  type Application,
  type ApplicationSignInExperience,
} from '@logto/schemas';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import DetailsForm from '@/components/DetailsForm';
import FormCard, { FormCardSkeleton } from '@/components/FormCard';
import ImageInputs, { themeToLogoName } from '@/components/ImageInputs';
import LogoAndFavicon from '@/components/ImageInputs/LogoAndFavicon';
import RequestDataError from '@/components/RequestDataError';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { appSpecificBrandingLink, logtoThirdPartyAppBrandingLink } from '@/consts';
import Button from '@/ds-components/Button';
import ColorPicker from '@/ds-components/ColorPicker';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import { emptyBranding } from '@/types/sign-in-experience';
import { trySubmitSafe } from '@/utils/form';
import { uriValidator } from '@/utils/validator';

import * as styles from './index.module.scss';
import useApplicationSignInExperienceSWR from './use-application-sign-in-experience-swr';
import useSignInExperienceSWR from './use-sign-in-experience-swr';
import { type ApplicationSignInExperienceForm, formatFormToSubmitData } from './utils';

type Props = {
  readonly application: Application;
  readonly isActive: boolean; // Support for conditional render UnsavedChangesAlertModal component
};

function Branding({ application, isActive }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();

  const formMethods = useForm<ApplicationSignInExperienceForm>({
    defaultValues: {
      tenantId: application.tenantId,
      applicationId: application.id,
      isBrandingEnabled: application.isThirdParty,
      branding: emptyBranding,
      color: {},
    },
  });

  const {
    handleSubmit,
    register,
    reset,
    control,
    watch,
    setValue,
    formState: { isDirty, isSubmitting, errors },
  } = formMethods;

  const api = useApi();

  const { data, error, mutate } = useApplicationSignInExperienceSWR(application.id);
  const { data: sieData, error: sieError, mutate: sieMutate } = useSignInExperienceSWR();

  const isApplicationSieLoading = !data && !error;
  const isSieLoading = !sieData && !sieError;
  const isLoading = isApplicationSieLoading || isSieLoading;
  const [isBrandingEnabled, color] = watch(['isBrandingEnabled', 'color']);

  const onSubmit = handleSubmit(
    trySubmitSafe(async (data) => {
      if (isSubmitting) {
        return;
      }

      const response = await api
        .put(`api/applications/${application.id}/sign-in-experience`, {
          json: formatFormToSubmitData(data),
        })
        .json<ApplicationSignInExperience>();

      void mutate(response);
      toast.success(t('general.saved'));
    })
  );

  const onRetryFetch = useCallback(() => {
    void mutate();
    void sieMutate();
  }, [mutate, sieMutate]);

  useEffect(() => {
    if (!data) {
      return;
    }

    reset({
      ...data,
      branding: { ...emptyBranding, ...data.branding },
      isBrandingEnabled: application.isThirdParty
        ? true
        : Object.keys(data.branding).length > 0 || Object.keys(data.color).length > 0,
    });
  }, [application.isThirdParty, data, reset]);

  // When enabling branding for the first time, fill the default color values to ensure the form
  // is valid; otherwise, directly save the form will be a no-op.
  useEffect(() => {
    if (isBrandingEnabled && Object.values(color).filter(Boolean).length === 0) {
      setValue('color', {
        primaryColor: defaultPrimaryColor,
        darkPrimaryColor: generateDarkColor(defaultPrimaryColor),
      });
    }
  }, [color, isBrandingEnabled, setValue]);

  const [primaryColor, darkPrimaryColor] = watch(['color.primaryColor', 'color.darkPrimaryColor']);
  const calculatedDarkPrimaryColor = useMemo(() => {
    return primaryColor && generateDarkColor(primaryColor);
  }, [primaryColor]);

  const handleResetColor = useCallback(() => {
    setValue('color.darkPrimaryColor', calculatedDarkPrimaryColor);
  }, [calculatedDarkPrimaryColor, setValue]);

  const NonThirdPartyBrandingForm = useCallback(
    () => (
      <>
        <LogoAndFavicon
          control={control}
          register={register}
          theme={Theme.Light}
          type="app_logo"
          logo={{ name: 'branding.logoUrl', error: errors.branding?.logoUrl }}
          favicon={{
            name: 'branding.favicon',
            error: errors.branding?.favicon,
          }}
        />
        <LogoAndFavicon
          control={control}
          register={register}
          theme={Theme.Dark}
          type="app_logo"
          logo={{ name: 'branding.darkLogoUrl', error: errors.branding?.darkLogoUrl }}
          favicon={{
            name: 'branding.darkFavicon',
            error: errors.branding?.darkFavicon,
          }}
        />
        <div className={styles.colors}>
          <Controller
            control={control}
            name="color.primaryColor"
            render={({ field: { name, value, onChange } }) => (
              <FormField title="application_details.branding.brand_color">
                <ColorPicker name={name} value={value} onChange={onChange} />
              </FormField>
            )}
          />
          <Controller
            control={control}
            name="color.darkPrimaryColor"
            render={({ field: { name, value, onChange } }) => (
              <FormField title="application_details.branding.brand_color_dark">
                <ColorPicker name={name} value={value} onChange={onChange} />
              </FormField>
            )}
          />
          {calculatedDarkPrimaryColor !== darkPrimaryColor && (
            <div className={styles.darkModeTip}>
              {t('sign_in_exp.color.dark_mode_reset_tip')}
              <Button
                type="text"
                size="small"
                title="sign_in_exp.color.reset"
                onClick={handleResetColor}
              />
            </div>
          )}
        </div>
      </>
    ),
    [
      control,
      errors.branding,
      register,
      calculatedDarkPrimaryColor,
      darkPrimaryColor,
      handleResetColor,
      t,
    ]
  );

  if (isLoading) {
    return <FormCardSkeleton />;
  }

  if (error && error.status !== 404) {
    return <RequestDataError error={error} onRetry={onRetryFetch} />;
  }

  return (
    <>
      <FormProvider {...formMethods}>
        <DetailsForm
          isDirty={isDirty}
          isSubmitting={isSubmitting}
          onDiscard={reset}
          onSubmit={onSubmit}
        >
          <FormCard
            title="application_details.branding.name"
            description={`application_details.branding.${
              application.isThirdParty ? 'description_third_party' : 'description'
            }`}
            learnMoreLink={{
              href: getDocumentationUrl(
                application.isThirdParty ? logtoThirdPartyAppBrandingLink : appSpecificBrandingLink
              ),
              targetBlank: 'noopener',
            }}
          >
            {application.isThirdParty && (
              <>
                <FormField title="application_details.branding.display_name">
                  <TextInput {...register('displayName')} placeholder={application.name} />
                </FormField>
                <ImageInputs
                  uploadTitle="application_details.branding.app_logo"
                  control={control}
                  register={register}
                  fields={Object.values(Theme).map((theme) => ({
                    name: `branding.${themeToLogoName[theme]}`,
                    error: errors.branding?.[themeToLogoName[theme]],
                    type: 'app_logo',
                    theme,
                  }))}
                />
              </>
            )}
            {!application.isThirdParty && (
              <>
                <FormField title="application_details.branding.app_level_sie">
                  <Switch
                    description="application_details.branding.app_level_sie_switch"
                    {...register('isBrandingEnabled')}
                  />
                </FormField>
                {isBrandingEnabled && <NonThirdPartyBrandingForm />}
              </>
            )}
          </FormCard>
          {application.isThirdParty && (
            <FormCard
              title="application_details.branding.more_info"
              description="application_details.branding.more_info_description"
            >
              <FormField title="application_details.branding.terms_of_use_url">
                <TextInput
                  {...register('termsOfUseUrl', {
                    validate: (value) =>
                      !value || uriValidator(value) || t('errors.invalid_uri_format'),
                  })}
                  error={errors.termsOfUseUrl?.message}
                  placeholder="https://"
                />
              </FormField>
              <FormField title="application_details.branding.privacy_policy_url">
                <TextInput
                  {...register('privacyPolicyUrl', {
                    validate: (value) =>
                      !value || uriValidator(value) || t('errors.invalid_uri_format'),
                  })}
                  error={errors.privacyPolicyUrl?.message}
                  placeholder="https://"
                />
              </FormField>
            </FormCard>
          )}
        </DetailsForm>
      </FormProvider>
      {isActive && <UnsavedChangesAlertModal hasUnsavedChanges={isDirty} onConfirm={reset} />}
    </>
  );
}

export default Branding;
