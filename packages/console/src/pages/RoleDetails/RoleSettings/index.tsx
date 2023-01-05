import type { Role } from '@logto/schemas';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import FormField from '@/components/FormField';
import TextInput from '@/components/TextInput';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import useApi from '@/hooks/use-api';

type Props = {
  data: Role;
  isDeleting: boolean;
  onRoleUpdated: (data: Role) => void;
};

const RoleSettings = ({ data, isDeleting, onRoleUpdated }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    handleSubmit,
    register,
    reset,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<Role>({
    defaultValues: data,
  });

  const api = useApi();

  const onSubmit = handleSubmit(async (formData) => {
    if (isSubmitting) {
      return;
    }

    const updatedRole = await api.patch(`/api/roles/${data.id}`, { json: formData }).json<Role>();
    reset(updatedRole);
    onRoleUpdated(updatedRole);
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
        <FormCard title="role_details.settings" description="role_details.settings_description">
          <FormField isRequired title="role_details.field_name">
            <TextInput {...register('name', { required: true })} hasError={Boolean(errors.name)} />
          </FormField>
          <FormField title="role_details.field_description">
            <TextInput {...register('description')} hasError={Boolean(errors.description)} />
          </FormField>
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleting && isDirty} />
    </>
  );
};

export default RoleSettings;
