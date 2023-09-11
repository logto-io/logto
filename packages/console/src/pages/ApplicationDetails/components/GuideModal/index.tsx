import type { ApplicationResponse } from '@logto/schemas';
import Modal from 'react-modal';

import ModalHeader from '@/components/Guide/ModalHeader';
import * as modalStyles from '@/scss/modal.module.scss';

import AppGuide from '../AppGuide';

import * as styles from './index.module.scss';

type Props = {
  guideId: string;
  app?: ApplicationResponse;
  onClose: () => void;
};

function GuideModal({ guideId, app, onClose }: Props) {
  return (
    <Modal shouldCloseOnEsc isOpen className={modalStyles.fullScreen} onRequestClose={onClose}>
      <div className={styles.modalContainer}>
        <ModalHeader
          title="applications.guide.modal_header_title"
          subtitle="applications.guide.header_subtitle"
          buttonText="applications.guide.cannot_find_guide"
          requestFormFieldLabel="applications.guide.describe_guide_looking_for"
          requestFormFieldPlaceholder="applications.guide.describe_guide_looking_for_placeholder"
          requestSuccessMessage="applications.guide.request_guide_successfully"
          onClose={onClose}
        />
        <AppGuide className={styles.guide} guideId={guideId} app={app} onClose={onClose} />
      </div>
    </Modal>
  );
}

export default GuideModal;
