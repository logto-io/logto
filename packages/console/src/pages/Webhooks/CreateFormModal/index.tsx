import { type Hook } from '@logto/schemas';
import Modal from 'react-modal';

import * as modalStyles from '@/scss/modal.module.scss';

import CreateForm from './CreateForm';

type Props = {
  readonly isOpen: boolean;
  readonly totalWebhookCount: number;
  readonly onClose: (createdHook?: Hook) => void;
};

function CreateFormModal({ isOpen, totalWebhookCount, onClose }: Props) {
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
      <CreateForm totalWebhookCount={totalWebhookCount} onClose={onClose} />
    </Modal>
  );
}

export default CreateFormModal;
