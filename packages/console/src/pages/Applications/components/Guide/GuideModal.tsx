import type { Application } from '@logto/schemas';
import Modal from 'react-modal';

import * as modalStyles from '@/scss/modal.module.scss';

import Guide from '.';

type Props = {
  app?: Application;
  onClose: (id: string) => void;
};

const GuideModal = ({ app, onClose }: Props) => {
  if (!app) {
    return null;
  }

  const closeModal = () => {
    onClose(app.id);
  };

  return (
    <Modal
      shouldCloseOnEsc
      isOpen={Boolean(app)}
      className={modalStyles.fullScreen}
      onRequestClose={closeModal}
    >
      <Guide app={app} onClose={closeModal} />
    </Modal>
  );
};

export default GuideModal;
