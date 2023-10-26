import { type Organization, type CreateOrganization } from '@logto/schemas';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

type Props = {
  isOpen: boolean;
  onClose: (createdId?: string) => void;
};

function CreateOrganizationModal({ isOpen, onClose }: Props) {
  const api = useApi();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Partial<CreateOrganization>>();
  const submit = handleSubmit(
    trySubmitSafe(async (json) => {
      const { id } = await api
        .post('api/organizations', {
          json,
        })
        .json<Organization>();
      onClose(id);
    })
  );

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      reset({});
    }
  }, [isOpen, reset]);

  return (
    <ReactModal
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onClose();
      }}
    >
      <ModalLayout
        title="organizations.create_organization"
        footer={
          <Button type="primary" title="general.create" isLoading={isSubmitting} onClick={submit} />
        }
        onClose={onClose}
      >
        <form>
          <FormField isRequired title="general.name">
            <TextInput
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              placeholder={t('organizations.organization_name_placeholder')}
              error={Boolean(errors.name)}
              {...register('name', { required: true })}
            />
          </FormField>
          <FormField title="general.description">
            <TextInput
              error={Boolean(errors.description)}
              placeholder={t('organizations.organization_description_placeholder')}
              {...register('description')}
            />
          </FormField>
        </form>
      </ModalLayout>
    </ReactModal>
  );
}

export default CreateOrganizationModal;
