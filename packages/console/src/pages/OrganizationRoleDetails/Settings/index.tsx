import { type OrganizationRole } from '@logto/schemas';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { organizationRoleLink } from '@/consts';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import { trySubmitSafe } from '@/utils/form';

type Props = {
  data: OrganizationRole;
  onUpdate: (updatedData: OrganizationRole) => void;
};

function Settings({ data, onUpdate }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<OrganizationRole>({ defaultValues: data });

  const api = useApi();

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      const updatedData = await api
        .patch(`api/organization-roles/${data.id}`, { json: formData })
        .json<OrganizationRole>();
      reset(updatedData);
      onUpdate(updatedData);
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
      <UnsavedChangesAlertModal hasUnsavedChanges={isDirty} />
    </DetailsForm>
  );
}

export default Settings;
