import { type ApplicationSecret } from '@logto/schemas';
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
import modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

import { type ApplicationSecretRow } from './EndpointsAndCredentials/use-secret-table-columns';

type FormData = { name: string; expiration: string };

type Props = {
  readonly appId: string;
  readonly secret: ApplicationSecretRow;
  readonly isOpen: boolean;
  readonly onClose: (updated: boolean) => void;
};

function EditSecretModal({ appId, secret, isOpen, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
  } = useForm<FormData>({ defaultValues: { name: secret.name } });
  const onCloseHandler = useCallback(
    (updated?: boolean) => {
      reset();
      onClose(updated ?? false);
    },
    [onClose, reset]
  );
  const api = useApi();

  const submit = handleSubmit(
    trySubmitSafe(async (data) => {
      const createdData = await api
        .patch(`api/applications/${appId}/secrets/${encodeURIComponent(secret.name)}`, {
          json: data,
        })
        .json<ApplicationSecret>();
      toast.success(t('application_details.secrets.edit_modal.edited', { name: createdData.name }));
      onCloseHandler(true);
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
        title="application_details.secrets.edit_modal.title"
        footer={
          <Button type="primary" title="general.save" isLoading={isSubmitting} onClick={submit} />
        }
        onClose={onCloseHandler}
      >
        <FormField isRequired title="general.name">
          <TextInput
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            placeholder="My secret"
            error={Boolean(errors.name)}
            {...register('name', { required: true })}
          />
        </FormField>
      </ModalLayout>
    </ReactModal>
  );
}

export default EditSecretModal;
