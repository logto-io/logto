import { type AdminConsoleKey } from '@logto/phrases';
import { type Nullable } from '@silverhand/essentials';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import TextInput from '@/ds-components/TextInput';
import * as modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

export type EditScopeData = {
  /** Only `description` is editable for all kinds of scopes */
  description: Nullable<string>;
};

type Props = {
  /** The scope name displayed in the name input field */
  readonly scopeName: string;
  /** The data to edit */
  readonly data: EditScopeData;
  /** Determines the translation keys for texts in the editor modal */
  readonly text: {
    /** The translation key of the modal title */
    title: AdminConsoleKey;
    /** The field name translation key for the name input */
    nameField: AdminConsoleKey;
    /** The field name translation key for the description input */
    descriptionField: AdminConsoleKey;
    /** The placeholder translation key for the description input */
    descriptionPlaceholder: AdminConsoleKey;
  };
  readonly onSubmit: (editedData: EditScopeData) => Promise<void>;
  readonly onClose: () => void;
};

function EditScopeModal({ scopeName, data, text, onClose, onSubmit }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const {
    handleSubmit,
    register,
    formState: { isSubmitting },
  } = useForm<EditScopeData>({ defaultValues: data });

  const onSubmitHandler = handleSubmit(
    trySubmitSafe(async (formData) => {
      await onSubmit(formData);
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
        title={text.title}
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
          <FormField title={text.nameField}>
            <TextInput readOnly value={scopeName} />
          </FormField>
          <FormField title={text.descriptionField}>
            <TextInput
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              placeholder={String(t(text.descriptionPlaceholder))}
              {...register('description')}
            />
          </FormField>
        </form>
      </ModalLayout>
    </ReactModal>
  );
}

export default EditScopeModal;
