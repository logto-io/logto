import { type OrganizationRole } from '@logto/schemas';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { organizationRoleLink } from '@/consts';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import { trySubmitSafe } from '@/utils/form';

import { type OrganizationRoleDetailsOutletContext } from '../types';

function Settings() {
  const { organizationRole, isDeleting, onOrganizationRoleUpdated } =
    useOutletContext<OrganizationRoleDetailsOutletContext>();

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<OrganizationRole>({ defaultValues: organizationRole });

  const api = useApi();

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      const updatedData = await api
        .patch(`api/organization-roles/${organizationRole.id}`, { json: formData })
        .json<OrganizationRole>();
      reset(updatedData);
      onOrganizationRoleUpdated(updatedData);
      toast.success(t('general.saved'));
    })
  );

  return (
    <DetailsForm
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onDiscard={reset}
    >
      <FormCard
        title="organization_role_details.general.settings"
        description="organization_role_details.general.description"
        learnMoreLink={{
          href: getDocumentationUrl(organizationRoleLink),
          targetBlank: 'noopener',
        }}
      >
        <FormField isRequired title="organization_role_details.general.name_field">
          <TextInput
            placeholder="viewer"
            error={Boolean(errors.name)}
            {...register('name', { required: true })}
          />
        </FormField>
        <FormField title="organization_role_details.general.description_field">
          <TextInput
            placeholder={t('organization_role_details.general.description_field_placeholder')}
            {...register('description')}
          />
        </FormField>
      </FormCard>
      <UnsavedChangesAlertModal
        hasUnsavedChanges={!isDeleting && isDirty} // Should not block navigation back to list page when deleting
      />
    </DetailsForm>
  );
}

export default Settings;
