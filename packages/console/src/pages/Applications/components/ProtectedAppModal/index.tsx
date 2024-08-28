import { type Application } from '@logto/schemas';
import Modal from 'react-modal';

import ModalLayout from '@/ds-components/ModalLayout';
import * as modalStyles from '@/scss/modal.module.scss';

import ProtectedAppForm from '../ProtectedAppForm';

type Props = {
  readonly onClose?: (createdApp?: Application) => void;
};

function ProtectedAppModal({ onClose }: Props) {
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
        onClose={onClose}
      >
        <ProtectedAppForm hasRequiredLabel onCreateSuccess={onClose} />
      </ModalLayout>
    </Modal>
  );
}

export default ProtectedAppModal;
