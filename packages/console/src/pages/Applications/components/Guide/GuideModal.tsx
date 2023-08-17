import type { ApplicationResponse } from '@logto/schemas';
import Modal from 'react-modal';

import * as modalStyles from '@/scss/modal.module.scss';

import GuideV2 from '../GuideV2';

type Props = {
  guideId: string;
  app?: ApplicationResponse;
  onClose: (id: string) => void;
};

function GuideModal({ guideId, app, onClose }: Props) {
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
      <GuideV2 guideId={guideId} app={app} onClose={closeModal} />
    </Modal>
  );
}

export default GuideModal;
