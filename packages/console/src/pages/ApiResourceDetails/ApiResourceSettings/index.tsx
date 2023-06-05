import type { Resource } from '@logto/schemas';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import FormField from '@/components/FormField';
import Switch from '@/components/Switch';
import TextInput from '@/components/TextInput';
import TextLink from '@/components/TextLink';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import useApi from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';

import type { ApiResourceDetailsOutletContext } from '../types';

function ApiResourceSettings() {
  const { resource, isDeleting, isLogtoManagementApiResource, onResourceUpdated } =
    useOutletContext<ApiResourceDetailsOutletContext>();

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();

  const {
    handleSubmit,
    register,
    reset,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<Resource>({
    defaultValues: resource,
  });

  const api = useApi();

  const onSubmit = handleSubmit(async ({ isDefault, ...rest }) => {
    if (isSubmitting) {
      return;
    }

    const [data] = await Promise.all([
      api.patch(`api/resources/${resource.id}`, { json: rest }).json<Resource>(),
      api
        .patch(`api/resources/${resource.id}/is-default`, { json: { isDefault } })
        .json<Resource>(),
    ]);

    // We cannot ensure the order of API requests, manually combine the results
    const updatedApiResource = { ...data, isDefault };
    reset(updatedApiResource);
    onResourceUpdated(updatedApiResource);
    toast.success(t('general.saved'));
  });

  return (
    <>
      <DetailsForm
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onDiscard={reset}
        onSubmit={onSubmit}
      >
        <FormCard
          title="api_resource_details.settings"
          description="api_resource_details.settings_description"
          learnMoreLink={getDocumentationUrl('/docs/recipes/protect-your-api')}
        >
          <FormField isRequired title="api_resources.api_name">
            <TextInput
              {...register('name', { required: true })}
              error={Boolean(errors.name)}
              readOnly={isLogtoManagementApiResource}
              placeholder={t('api_resources.api_name_placeholder')}
            />
          </FormField>
          <FormField isRequired title="api_resource_details.token_expiration_time_in_seconds">
            <TextInput
              {...register('accessTokenTtl', {
                required: true,
                valueAsNumber: true,
              })}
              type="number"
              error={Boolean(errors.accessTokenTtl)}
              placeholder={t('api_resource_details.token_expiration_time_in_seconds_placeholder')}
            />
          </FormField>
          {!isLogtoManagementApiResource && (
            <FormField title="api_resources.default_api">
              <Switch
                {...register('isDefault')}
                label={
                  <Trans
                    components={{
                      a: (
                        <TextLink
                          href="https://docs.logto.io/docs/references/resources/#default-api"
                          target="_blank"
                        />
                      ),
                    }}
                  >
                    {t('api_resources.default_api_label')}
                  </Trans>
                }
              />
            </FormField>
          )}
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleting && isDirty} />
    </>
  );
}

export default ApiResourceSettings;
