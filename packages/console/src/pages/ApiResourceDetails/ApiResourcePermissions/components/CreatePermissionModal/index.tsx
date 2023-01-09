import type { Scope } from '@logto/schemas';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/components/Button';
import FormField from '@/components/FormField';
import ModalLayout from '@/components/ModalLayout';
import TextInput from '@/components/TextInput';
import useApi from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';

type Props = {
  resourceId: string;
  onClose: (scope?: Scope) => void;
};

type CreatePermissionFormData = Pick<Scope, 'name' | 'description'>;

const CreatePermissionModal = ({ resourceId, onClose }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    handleSubmit,
    register,
    formState: { isSubmitting },
  } = useForm<CreatePermissionFormData>();

  const api = useApi();

  const onSubmit = handleSubmit(async (formData) => {
    if (isSubmitting) {
      return;
    }

    const createdScope = await api
      .post(`/api/resources/${resourceId}/scopes`, { json: formData })
      .json<Scope>();

    onClose(createdScope);
  });

  return (
    <ReactModal
      isOpen
      shouldCloseOnEsc
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onClose();
      }}
    >
      <ModalLayout
        title="api_resource_details.permission.create_title"
        subtitle="api_resource_details.permission.create_subtitle"
        footer={
          <Button
            isLoading={isSubmitting}
            htmlType="submit"
            title="api_resource_details.permission.confirm_create"
            size="large"
            type="primary"
            onClick={onSubmit}
          />
        }
        onClose={onClose}
      >
        <form>
          <FormField isRequired title="api_resource_details.permission.name">
            <TextInput
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              placeholder={t('api_resource_details.permission.name_placeholder')}
              {...register('name', { required: true })}
            />
          </FormField>
          <FormField title="api_resource_details.permission.description">
            <TextInput
              placeholder={t('api_resource_details.permission.description_placeholder')}
              {...register('description')}
            />
          </FormField>
        </form>
      </ModalLayout>
    </ReactModal>
  );
};

export default CreatePermissionModal;
