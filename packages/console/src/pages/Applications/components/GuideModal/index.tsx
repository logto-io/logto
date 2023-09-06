import type { ApplicationResponse } from '@logto/schemas';
import Modal from 'react-modal';

import * as modalStyles from '@/scss/modal.module.scss';

import Guide from '../Guide';
import GuideHeader from '../GuideHeader';

import * as styles from './index.module.scss';

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
      <div className={styles.modalContainer}>
        <GuideHeader onClose={closeModal} />
        <Guide className={styles.guide} guideId={guideId} app={app} onClose={closeModal} />
      </div>
    </Modal>
  );
}

export default GuideModal;
