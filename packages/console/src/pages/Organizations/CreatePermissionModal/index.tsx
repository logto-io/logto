import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';

type Props = {
  isOpen: boolean;
  onFinish: () => void;
};

function CreatePermissionModal({ isOpen, onFinish }: Props) {
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ name: string; description?: string }>({ defaultValues: { name: '' } });
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const addPermission = handleSubmit(async (json) => {
    setIsLoading(true);
    try {
      await api.post('api/organization-scopes', {
        json,
      });
      onFinish();
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <ReactModal
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onFinish}
    >
      <ModalLayout
        title="organizations.create_organization_permission"
        footer={
          <Button
            type="primary"
            title="organizations.create_permission"
            isLoading={isLoading}
            onClick={addPermission}
          />
        }
        onClose={onFinish}
      >
        <FormField isRequired title="general.name">
          <TextInput
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            placeholder="read:appointment"
            error={Boolean(errors.name)}
            {...register('name', { required: true })}
          />
        </FormField>
        <FormField title="general.description">
          <TextInput
            placeholder={t('organizations.create_permission_placeholder')}
            error={Boolean(errors.description)}
            {...register('description')}
          />
        </FormField>
      </ModalLayout>
    </ReactModal>
  );
}
export default CreatePermissionModal;
