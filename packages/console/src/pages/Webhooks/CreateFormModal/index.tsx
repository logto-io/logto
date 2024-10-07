import { type Hook } from '@logto/schemas';
import Modal from 'react-modal';

import modalStyles from '@/scss/modal.module.scss';

import CreateForm from './CreateForm';

type Props = {
  readonly isOpen: boolean;
  readonly onClose: (createdHook?: Hook) => void;
};

function CreateFormModal({ isOpen, onClose }: Props) {
  return (
    <Modal
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={() => {
        onClose();
      }}
    >
      <CreateForm onClose={onClose} />
    </Modal>
  );
}

export default CreateFormModal;
