import { type OrganizationRole } from '@logto/schemas';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

type FormData = Pick<OrganizationRole, 'name' | 'description'>;

type Props = {
  readonly isOpen: boolean;
  readonly onClose: (createdOrganizationRole?: OrganizationRole) => void;
};

function CreateOrganizationRoleModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
  } = useForm<FormData>();

  const onCloseHandler = useCallback(
    (createdData?: OrganizationRole) => {
      // Reset form when modal is closed
      reset();
      onClose(createdData);
    },
    [onClose, reset]
  );

  const api = useApi();

  const submit = handleSubmit(
    trySubmitSafe(async (formData) => {
      const createdData = await api
        .post('api/organization-roles', { json: formData })
        .json<OrganizationRole>();
      toast.success(
        t('organization_template.roles.create_modal.created', { name: createdData.name })
      );
      onCloseHandler(createdData);
    })
  );

  return (
    <ReactModal
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onCloseHandler();
      }}
    >
      <ModalLayout
        title="organization_template.roles.create_modal.title"
        footer={
          <Button
            type="primary"
            title="organization_template.roles.create_modal.create"
            isLoading={isSubmitting}
            onClick={submit}
          />
        }
        onClose={onCloseHandler}
      >
        <FormField isRequired title="organization_template.roles.create_modal.name_field">
          <TextInput
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            placeholder="viewer"
            error={Boolean(errors.name)}
            {...register('name', { required: true })}
          />
        </FormField>
        <FormField title="organization_template.permissions.description_field_name">
          <TextInput
            placeholder={t('organization_role_details.general.description_field_placeholder')}
            error={Boolean(errors.description)}
            {...register('description')}
          />
        </FormField>
      </ModalLayout>
    </ReactModal>
  );
}

export default CreateOrganizationRoleModal;
