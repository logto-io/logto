import { ApplicationType, type Application } from '@logto/schemas';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import Button from '@/ds-components/Button';
import ModalLayout from '@/ds-components/ModalLayout';
import useApi from '@/hooks/use-api';
import * as modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

import ProtectedAppForm from '../ProtectedAppForm';

type Props = {
  onClose?: (createdApp?: Application) => void;
};

function ProtectedAppModal({ onClose }: Props) {
  const methods = useForm<ProtectedAppForm>();
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();

  const onSubmit = handleSubmit(
    trySubmitSafe(async (data) => {
      if (isSubmitting) {
        return;
      }

      const createdApp = await api
        .post('api/applications', {
          json: {
            name: data.subDomain,
            type: ApplicationType.Protected,
            protectedAppMetadata: data,
          },
        })
        .json<Application>();
      toast.success(t('applications.application_created'));
      onClose?.(createdApp);
    })
  );

  return (
    <Modal
      shouldCloseOnEsc
      isOpen
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onClose?.();
      }}
    >
      <ModalLayout
        title="protected_app.modal_title"
        subtitle="protected_app.modal_subtitle"
        size="large"
        footer={
          <Button
            size="large"
            type="primary"
            title="protected_app.form.create_application"
            isLoading={isSubmitting}
            onClick={onSubmit}
          />
        }
        onClose={onClose}
      >
        <FormProvider {...methods}>
          <ProtectedAppForm />
        </FormProvider>
      </ModalLayout>
    </Modal>
  );
}

export default ProtectedAppModal;
