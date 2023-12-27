import { type Application, type ApplicationSignInExperience } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useCallback, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import DetailsForm from '@/components/DetailsForm';
import FormCard, { FormCardSkeleton } from '@/components/FormCard';
import RequestDataError from '@/components/RequestDataError';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import useUserAssetsService from '@/hooks/use-user-assets-service';
import { trySubmitSafe } from '@/utils/form';
import { uriValidator } from '@/utils/validator';

import LogoUploader from './LogoUploader';
import useApplicationSignInExperienceSWR from './use-application-sign-in-experience-swr';
import useSignInExperienceSWR from './use-sign-in-experience-swr';

type Props = {
  application: Application;
};

/**
 * Format the form data to match the API request body
 * - Omit `applicationId` and `tenantId` from the request body
 * - Remove the empty `logoUrl` and `darkLogoUrl` fields in the `branding` object
 **/
const formatFormSubmitData = (
  data: ApplicationSignInExperience
): Omit<ApplicationSignInExperience, 'applicationId' | 'tenantId'> => {
  const { branding, applicationId, tenantId, ...rest } = data;

  return {
    ...rest,
    branding: {
      ...conditional(branding.logoUrl && { logoUrl: branding.logoUrl }),
      ...conditional(branding.darkLogoUrl && { darkLogoUrl: branding.darkLogoUrl }),
    },
  };
};

function Branding({ application }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const formMethods = useForm<ApplicationSignInExperience>({
    defaultValues: {
      tenantId: application.tenantId,
      applicationId: application.id,
      branding: {},
    },
  });

  const {
    handleSubmit,
    register,
    reset,
    formState: { isDirty, isSubmitting, errors },
  } = formMethods;

  const api = useApi();

  const { data, error, mutate } = useApplicationSignInExperienceSWR(application.id);
  const { data: sieData, error: sieError, mutate: sieMutate } = useSignInExperienceSWR();
  const { isReady: isUserAssetsServiceReady, isLoading: isUserAssetsServiceLoading } =
    useUserAssetsService();

  const isApplicationSieLoading = !data && !error;
  const isSieLoading = !sieData && !sieError;
  const isLoading = isApplicationSieLoading || isSieLoading || isUserAssetsServiceLoading;

  const onSubmit = handleSubmit(
    trySubmitSafe(async (data) => {
      if (isSubmitting) {
        return;
      }

      const response = await api
        .put(`api/applications/${application.id}/sign-in-experience`, {
          json: formatFormSubmitData(data),
        })
        .json<ApplicationSignInExperience>();

      reset(response);
      void mutate();
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

    if (isDirty) {
      return;
    }

    reset(data);
  }, [data, isDirty, reset]);

  if (isLoading) {
    return <FormCardSkeleton />;
  }

  // Show error details if the error is not 404
  if (error && error.status !== 404) {
    return <RequestDataError error={error} onRetry={onRetryFetch} />;
  }

  const isDarkModeEnabled = sieData?.color.isDarkModeEnabled;

  return (
    <FormProvider {...formMethods}>
      <DetailsForm
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onDiscard={reset}
        onSubmit={onSubmit}
      >
        <FormCard
          title="application_details.branding.branding"
          description="application_details.branding.branding_description"
        >
          <FormField title="application_details.branding.display_name">
            <TextInput {...register('displayName')} />
          </FormField>
          {isUserAssetsServiceReady && (
            <FormField title="application_details.branding.display_logo">
              <LogoUploader isDarkModeEnabled={isDarkModeEnabled} />
            </FormField>
          )}
          {/* Display the TextInput field if image upload service is not available */}
          {!isUserAssetsServiceReady && (
            <FormField title="application_details.branding.display_logo">
              <TextInput
                {...register('branding.logoUrl', {
                  validate: (value) =>
                    !value || uriValidator(value) || t('errors.invalid_uri_format'),
                })}
                error={errors.branding?.logoUrl?.message}
              />
            </FormField>
          )}
          {/* Display the Dark logo field only if the dark mode is enabled in the global sign-in-experience */}
          {!isUserAssetsServiceReady && isDarkModeEnabled && (
            <FormField title="application_details.branding.display_logo_dark">
              <TextInput
                {...register('branding.darkLogoUrl', {
                  validate: (value) =>
                    !value || uriValidator(value) || t('errors.invalid_uri_format'),
                })}
                error={errors.branding?.darkLogoUrl?.message}
              />
            </FormField>
          )}
        </FormCard>
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
      </DetailsForm>
    </FormProvider>
  );
}

export default Branding;
