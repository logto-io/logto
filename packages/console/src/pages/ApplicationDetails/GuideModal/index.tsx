import type { ApplicationResponse } from '@logto/schemas';
import Modal from 'react-modal';

import ModalHeader from '@/components/Guide/ModalHeader';
import * as modalStyles from '@/scss/modal.module.scss';

import AppGuide from '../components/AppGuide';

import * as styles from './index.module.scss';

type Props = {
  readonly guideId: string;
  readonly app?: ApplicationResponse;
  readonly onClose: () => void;
};

function GuideModal({ guideId, app, onClose }: Props) {
  return (
    <Modal shouldCloseOnEsc isOpen className={modalStyles.fullScreen} onRequestClose={onClose}>
      <div className={styles.modalContainer}>
        <ModalHeader
          title="guide.app.guide_modal_title"
          subtitle="guide.app.modal_subtitle"
          buttonText="guide.cannot_find_guide"
          requestFormFieldLabel="guide.describe_guide_looking_for"
          requestFormFieldPlaceholder="guide.app.describe_guide_looking_for_placeholder"
          requestSuccessMessage="guide.request_guide_successfully"
          onClose={onClose}
        />
        <AppGuide className={styles.guide} guideId={guideId} app={app} onClose={onClose} />
      </div>
    </Modal>
  );
}

export default GuideModal;
