import { type Organization } from '@logto/schemas';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import { trySubmitSafe } from '@/utils/form';

type Props = {
  /**
   * Whether the organization is being deleted, this is used to disable the unsaved
   * changes alert modal.
   */
  isDeleting: boolean;
  data: Organization;
  onUpdated: (data: Organization) => void;
};

function Settings({ isDeleting, data, onUpdated }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    register,
    reset,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm<Partial<Organization>>({
    defaultValues: data,
  });
  const api = useApi();

  const onSubmit = handleSubmit(
    trySubmitSafe(async (json) => {
      if (isSubmitting) {
        return;
      }

      const updatedData = await api
        .patch(`api/organizations/${data.id}`, { json })
        .json<Organization>();
      reset(updatedData);
      toast.success(t('general.saved'));
      onUpdated(updatedData);
    })
  );

  return (
    <DetailsForm
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      onDiscard={reset}
      onSubmit={onSubmit}
    >
      <FormCard
        title="general.settings_nav"
        description="organization_details.settings_description"
      >
        <FormField title="general.name">
          <TextInput
            placeholder={t('organization_details.name_placeholder')}
            {...register('name')}
          />
        </FormField>
        <FormField title="general.description">
          <TextInput
            placeholder={t('organization_details.description_placeholder')}
            {...register('description')}
          />
        </FormField>
      </FormCard>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleting && isDirty} />
    </DetailsForm>
  );
}

export default Settings;
