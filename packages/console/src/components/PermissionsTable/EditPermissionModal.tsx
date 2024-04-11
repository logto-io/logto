import { type ScopeResponse } from '@logto/schemas';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import TextInput from '@/ds-components/TextInput';
import * as modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

type Props = {
  data: ScopeResponse;
  onClose: () => void;
  onSubmit: (scope: ScopeResponse) => Promise<void>;
};

function EditPermissionModal({ data, onClose, onSubmit }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const {
    handleSubmit,
    register,
    formState: { isSubmitting },
  } = useForm<ScopeResponse>({ defaultValues: data });

  const onSubmitHandler = handleSubmit(
    trySubmitSafe(async (formData) => {
      await onSubmit({ ...data, ...formData });
      onClose();
    })
  );

  return (
    <ReactModal
      shouldCloseOnEsc
      isOpen={Boolean(data)}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onClose();
      }}
    >
      <ModalLayout
        title="permissions.edit_title"
        footer={
          <>
            <Button isLoading={isSubmitting} title="general.cancel" onClick={onClose} />
            <Button
              isLoading={isSubmitting}
              title="general.save"
              type="primary"
              htmlType="submit"
              onClick={onSubmitHandler}
            />
          </>
        }
        onClose={onClose}
      >
        <form>
          <FormField title="api_resource_details.permission.name">
            <TextInput readOnly value={data.name} />
          </FormField>
          <FormField title="api_resource_details.permission.description">
            <TextInput
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              placeholder={t('api_resource_details.permission.description_placeholder')}
              {...register('description')}
            />
          </FormField>
        </form>
      </ModalLayout>
    </ReactModal>
  );
}

export default EditPermissionModal;
