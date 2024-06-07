import { RoleType, type Role } from '@logto/schemas';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import { trySubmitSafe } from '@/utils/form';

import type { RoleDetailsOutletContext } from '../types';

function RoleSettings() {
  const { role, isDeleting, onRoleUpdated } = useOutletContext<RoleDetailsOutletContext>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    handleSubmit,
    register,
    reset,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<Role>({
    defaultValues: role,
  });

  const api = useApi();

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      if (isSubmitting) {
        return;
      }

      const updatedRole = await api.patch(`api/roles/${role.id}`, { json: formData }).json<Role>();
      reset(updatedRole);
      onRoleUpdated(updatedRole);
      toast.success(t('general.saved'));
    })
  );

  return (
    <>
      <DetailsForm
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onDiscard={reset}
        onSubmit={onSubmit}
      >
        <FormCard
          title="role_details.settings"
          description="role_details.settings_description"
          learnMoreLink={{
            href: 'https://docs.logto.io/docs/recipes/rbac/manage-permissions-and-roles#manage-roles',
            targetBlank: 'noopener',
          }}
        >
          <FormField isRequired title="role_details.field_name">
            <TextInput {...register('name', { required: true })} error={Boolean(errors.name)} />
          </FormField>
          <FormField isRequired title="role_details.field_description">
            <TextInput
              {...register('description', { required: true })}
              error={Boolean(errors.description)}
            />
          </FormField>
          {role.type === RoleType.User && (
            <FormField title="role_details.field_is_default">
              <Switch
                label={t('role_details.field_is_default_description')}
                {...register('isDefault')}
              />
            </FormField>
          )}
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleting && isDirty} />
    </>
  );
}

export default RoleSettings;
