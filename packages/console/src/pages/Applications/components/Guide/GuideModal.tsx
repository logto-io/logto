import type { Application } from '@logto/schemas';
import Modal from 'react-modal';

import { isProduction } from '@/consts/env';
import * as modalStyles from '@/scss/modal.module.scss';

import GuideV2 from '../GuideV2';

import Guide from '.';

type Props = {
  guideId: string;
  app?: Application;
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
      {/* Switch to v2 once migration is complete. */}
      {isProduction ? (
        <Guide app={app} onClose={closeModal} />
      ) : (
        <GuideV2 guideId={guideId} app={app} onClose={closeModal} />
      )}
    </Modal>
  );
}

export default GuideModal;
